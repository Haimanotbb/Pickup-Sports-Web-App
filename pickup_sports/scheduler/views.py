from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated, AllowAny,IsAuthenticatedOrReadOnly
from rest_framework.authtoken.models import Token
# from django.contrib.auth import get_user_model

from .models import Game, Participant, Sport, Comment
from .serializers import GameSerializer, SportSerializer, ParticipantSerializer, CustomUserProfileUpdateSerializer, UserProfileSerializer, CommentSerializer
from django.contrib.auth import login, logout, get_user_model
from django.shortcuts import redirect
from urllib.parse import urlencode
from django.conf import settings
import requests
import xml.etree.ElementTree as ET
from django.http import HttpResponse
import random
import string
from django.utils import timezone
from django.db.models import Q


def make_random_password(length=8):
    """Generate a random password with the given length."""
    characters = string.ascii_letters + string.digits + string.punctuation
    return ''.join(random.choice(characters) for i in range(length))


CAS_SERVER_URL = "https://secure6.its.yale.edu/cas/"
FRONTEND_URL_AFTER_LOGIN = "http://localhost:3000/games"


@api_view(['GET'])
@permission_classes([AllowAny])
def cas_login(request):
    service_url = request.build_absolute_uri(request.path)
    ticket = request.GET.get('ticket')

    if not ticket:
        cas_login_url = f"{settings.CAS_BASE_URL}/login?service={service_url}"
        return redirect(cas_login_url)

    validate_url = f"{settings.CAS_BASE_URL}/serviceValidate"
    params = {'ticket': ticket, 'service': service_url}
    try:
        response = requests.get(validate_url, params=params, timeout=5)
        response.raise_for_status()
    except requests.RequestException:
        return HttpResponse("Error contacting CAS server.", status=500)

    try:
        root = ET.fromstring(response.text)
    except ET.ParseError:
        return HttpResponse("Invalid response from CAS server.", status=500)

    ns = {'cas': 'http://www.yale.edu/tp/cas'}
    auth_success = root.find('cas:authenticationSuccess', ns)
    if auth_success is not None:
        username_el = auth_success.find('cas:user', ns)
        if username_el is None or not username_el.text:
            return HttpResponse("CAS authentication succeeded but no user data found.", status=400)
        username = username_el.text.strip()

        User = get_user_model()
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': '',
                'password': make_random_password(),
            }
        )
        login(request, user, backend='django_cas_ng.backends.CASBackend')
        token, _ = Token.objects.get_or_create(user=user)

        if created or not user.email or not user.name:
            return redirect(f"http://localhost:3000/profile/setup?token={token.key}")
        else:
            return redirect(f"{FRONTEND_URL_AFTER_LOGIN}?token={token.key}")
    else:
        return HttpResponse("CAS authentication failed.", status=401)


@api_view(['GET'])
@permission_classes([AllowAny])
def cas_logout(request):
    logout(request)
    service_url = request.build_absolute_uri('/')
    cas_logout_url = f"https://secure6.its.yale.edu/cas/logout?service={service_url}"
    return redirect(cas_logout_url)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_profile(request, id):
    User = get_user_model()
    try:
        user = User.objects.get(pk=id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = UserProfileSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Get user profile


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_detail(request):
    """
    Retrieve the authenticated user's profile
    """
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_update(request):
    """
    Update the authenticated user's profile
    """

    serializer = CustomUserProfileUpdateSerializer(
        request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()

        full_serializer = UserProfileSerializer(request.user)
        return Response(full_serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_game(request, pk):
    """
    POST /api/games/<pk>/leave/
    Only non‑creators may leave—a creator must cancel or delete instead.
    """
    try:
        game = Game.objects.get(pk=pk)
    except Game.DoesNotExist:
        return Response({"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND)

    # Block the creator
    if game.creator == request.user:
        return Response(
            {"error": "Creators can’t leave their own game. You can cancel or delete it instead."},
            status=status.HTTP_403_FORBIDDEN
        )

    # Block if they never joined
    if not Participant.objects.filter(user=request.user, game=game).exists():
        return Response(
            {"error": "You haven’t joined this game."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Otherwise remove the participation
    Participant.objects.filter(user=request.user, game=game).delete()
    return Response({"message": "Left the game."}, status=status.HTTP_200_OK)


# List all games (GET /api/games/)
@api_view(['GET'])
@permission_classes([AllowAny])
def game_list(request):
    now = timezone.now()
    games = Game.objects.filter(end_time__gte=now)
    sport_id = request.query_params.get('sport_id')
    start_date = request.query_params.get('start_date')
    if sport_id:
        games = games.filter(sport_id=sport_id)
    if start_date:
        games = games.filter(start_time__gte=start_date)
    serializer = GameSerializer(games, many=True)
    return Response(serializer.data)


# Create a new game (POST /api/games/create/)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def game_create(request):
    serializer = GameSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(creator=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Cancel a game (POST /api/games/<pk>/cancel/)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_game(request, pk):
    try:
        game = Game.objects.get(pk=pk)
    except Game.DoesNotExist:
        return Response({"error": "Game not found."}, status=status.HTTP_404_NOT_FOUND)
    if game.creator != request.user:
        return Response({"error": "You are not authorized to cancel this game."}, status=status.HTTP_403_FORBIDDEN)
    game.status = 'cancelled'
    game.save()
    return Response({"message": "Game cancelled. It will remain cancelled until the scheduled end time."}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def game_detail(request, pk):
    try:
        game = Game.objects.get(pk=pk)
    except Game.DoesNotExist:
        return Response({"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = GameSerializer(game)
    return Response(serializer.data)


# Update a game (PUT /api/games/<pk>/update/)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def game_update(request, pk):
    try:
        game = Game.objects.get(pk=pk)
    except Game.DoesNotExist:
        return Response({"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND)
    if game.creator != request.user:
        return Response({"error": "You are not authorized to update this game"}, status=status.HTTP_403_FORBIDDEN)
    serializer = GameSerializer(game, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Delete a game (DELETE /api/games/<pk>/delete/)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def game_delete(request, pk):
    try:
        game = Game.objects.get(pk=pk)
    except Game.DoesNotExist:
        return Response({"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND)
    if game.creator != request.user:
        return Response({"error": "You are not authorized to delete this game"}, status=status.HTTP_403_FORBIDDEN)
    game.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# view previously created games
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_archived_games(request):
    now = timezone.now()
    games = Game.objects.filter(creator=request.user, end_time__lte=now)
    serializer = GameSerializer(games, many=True)
    return Response(serializer.data)


# Join a game (POST /api/games/<pk>/join/)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_game(request, pk):
    try:
        game = Game.objects.get(pk=pk)
    except Game.DoesNotExist:
        return Response({"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND)

    if game.creator == request.user:
        return Response(
            {"error": "Creators cannot join their own game."},
            status=status.HTTP_403_FORBIDDEN
        )

    if game.participant_set.filter(user=request.user).exists():
        return Response({"error": "You have already joined this game"}, status=status.HTTP_400_BAD_REQUEST)
    if game.capacity and game.participants.count() >= game.capacity:
        return Response(
        {"error": "Game at capacity."},
        status=status.HTTP_400_BAD_REQUEST
        )
    
    Participant.objects.create(user=request.user, game=game)
    return Response({"message": "Successfully joined the game"}, status=status.HTTP_200_OK)


# List all sports (GET /api/sports/)
@api_view(['GET'])
@permission_classes([AllowAny])
def sport_list(request):
    sports = Sport.objects.all()
    serializer = SportSerializer(sports, many=True)
    return Response(serializer.data)



@api_view(['GET','POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def game_comments(request, game_pk):
    """
    GET  /api/games/{game_pk}/comments/   → list
    POST /api/games/{game_pk}/comments/   → create
    """
    try:
        game = Game.objects.get(pk=game_pk)
    except Game.DoesNotExist:
        return Response({"error": "Game not found."},
                        status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        qs = Comment.objects.filter(game=game).order_by('created')
        serializer = CommentSerializer(qs, many=True)
        return Response(serializer.data)
    user = request.user
    is_creator   = (game.creator == user)
    is_participant = Participant.objects.filter(game=game, user=user).exists()
    if not (is_creator or is_participant):
        return Response(
          {"error": "Only the game creator or participants may comment."},
          status=status.HTTP_403_FORBIDDEN
        )
    # POST
    data = request.data.copy()
    data['game'] = game_pk
    serializer = CommentSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        serializer.save(author=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def user_list(request):
    """
    GET /api/users/?search=<q>
    Return users whose name, username or email contains q.
    """
    q = request.query_params.get('search', '').strip()
    if not q:
        return Response([], status=200)
    qs = User.objects.filter(
        Q(username__icontains=q) |
        Q(email__icontains=q) |
        Q(name__icontains=q)
    )
    serializer = UserProfileSerializer(qs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def user_games(request, user_id):
    """
    GET /api/users/<user_id>/games/
    Return all games where user is creator or participant.
    """
    games = Game.objects.filter(
        Q(creator__id=user_id) |
        Q(participants__user__id=user_id)
    ).distinct()
    serializer = GameSerializer(games, many=True)
    return Response(serializer.data)