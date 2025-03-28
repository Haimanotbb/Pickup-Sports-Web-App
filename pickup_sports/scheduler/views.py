from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from .models import Game, Participant, Sport
from .serializers import GameSerializer, SportSerializer, ParticipantSerializer

# Login to get a token (POST /api/login/)
@api_view(['POST'])
@permission_classes([AllowAny])  # Allow anyone to access this endpoint
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    #user = authenticate(request, email=email, password=password)
    user = authenticate(request, username=email, password=password)

    if user is not None:
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

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