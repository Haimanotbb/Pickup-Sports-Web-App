from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, get_user_model
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from .models import Game, Participant, Sport
from .serializers import GameSerializer, SportSerializer, ParticipantSerializer, CustomUserProfileUpdateSerializer, UserProfileSerializer
from django.contrib.auth import login, logout, get_user_model
from django.shortcuts import redirect
from urllib.parse import urlencode
from django.conf import settings
import requests
import xml.etree.ElementTree as ET
from django.http import HttpResponse
import random
import string


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
        # Here we deliberately leave email blank (or use a placeholder) so that missing info is obvious.
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                # Alternatively: f"{username}@yale.edu" if you want a placeholder
                'email': '',
                'password': make_random_password(),
            }
        )
        login(request, user, backend='django_cas_ng.backends.CASBackend')
        token, _ = Token.objects.get_or_create(user=user)

        # Check if essential details are missing (adjust the condition as necessary)
        if created or not user.email or not user.name:
            # Redirect to a profile completion page
            return redirect(f"http://localhost:3000/profile/setup?token={token.key}")
        else:
            return redirect(f"{FRONTEND_URL_AFTER_LOGIN}?token={token.key}")
    else:
        return HttpResponse("CAS authentication failed.", status=401)


@api_view(['GET'])
@permission_classes([AllowAny])
def cas_logout(request):
    # Log out locally
    logout(request)

    # Build the URL to which CAS should redirect after logout (e.g., homepage).
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

# Sign Up


@api_view(['POST'])
@permission_classes([AllowAny])
def signup_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    name = request.data.get('name', '')

    # Check if user already exists
    User = get_user_model()
    if User.objects.filter(email=email).exists():
        return Response({"error": "User with this email already exists."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Create the user
    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        name=name
    )

    # Generate token
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key}, status=status.HTTP_201_CREATED)


# Login to get a token (POST /api/login/)
# @api_view(['POST'])
# @permission_classes([AllowAny])  # Allow anyone to access this endpoint
# def login_user(request):
#     email = request.data.get('email')
#     password = request.data.get('password')
#     #user = authenticate(request, email=email, password=password)
#     user = authenticate(request, username=email, password=password)

#     if user is not None:
#         token, created = Token.objects.get_or_create(user=user)
#         return Response({'token': token.key}, status=status.HTTP_200_OK)
#     return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# List all games (GET /api/games/)
@api_view(['GET'])
@permission_classes([AllowAny])  # Allow anyone to list games
def game_list(request):
    games = Game.objects.all()
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
@permission_classes([IsAuthenticated])  # Require authentication
def game_create(request):
    serializer = GameSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(creator=request.user)  # Use the authenticated user
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Retrieve a single game (GET /api/games/<pk>/)


@api_view(['GET'])
@permission_classes([AllowAny])  # Allow anyone to view game details
def game_detail(request, pk):
    try:
        game = Game.objects.get(pk=pk)
    except Game.DoesNotExist:
        return Response({"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = GameSerializer(game)
    return Response(serializer.data)

# Update a game (PUT /api/games/<pk>/update/)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])  # Require authentication
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
@permission_classes([IsAuthenticated])  # Require authentication
def game_delete(request, pk):
    try:
        game = Game.objects.get(pk=pk)
    except Game.DoesNotExist:
        return Response({"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND)
    if game.creator != request.user:
        return Response({"error": "You are not authorized to delete this game"}, status=status.HTTP_403_FORBIDDEN)
    game.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# Join a game (POST /api/games/<pk>/join/)


@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Require authentication
def join_game(request, pk):
    try:
        game = Game.objects.get(pk=pk)
    except Game.DoesNotExist:
        return Response({"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND)

    if game.participant_set.filter(user=request.user).exists():
        return Response({"error": "You have already joined this game"}, status=status.HTTP_400_BAD_REQUEST)

    Participant.objects.create(user=request.user, game=game)
    return Response({"message": "Successfully joined the game"}, status=status.HTTP_200_OK)

# List all sports (GET /api/sports/)


@api_view(['GET'])
@permission_classes([AllowAny])  # Allow anyone to list sports
def sport_list(request):
    sports = Sport.objects.all()
    serializer = SportSerializer(sports, many=True)
    return Response(serializer.data)
