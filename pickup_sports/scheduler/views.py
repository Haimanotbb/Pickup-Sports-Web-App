from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Game, Participant, Sport
from .serializers import GameSerializer, SportSerializer, ParticipantSerializer

# List all games (GET)
@api_view(['GET'])
def game_list(request):
    games = Game.objects.all()
    serializer = GameSerializer(games, many=True)
    return Response(serializer.data)

# Create a new game (POST)
@api_view(['POST'])
def game_create(request):
    serializer = GameSerializer(data=request.data)
    if serializer.is_valid():
        # Set a default user for the creator field
        User = get_user_model()
        try:
            default_user = User.objects.get(email='h2berhanu@gmail.com')
        except User.DoesNotExist:
            default_user = User.objects.create_user(
                username='h2berhanu',  # Required by AbstractUser
                email='h2berhanu@gmail.com',
                name='Haimanot Berhanu',
                password='dhlcpsc419'
            )
        serializer.save(creator=default_user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Retrieve a single game (GET)
@api_view(['GET'])
def game_detail(request, pk):
    try:
        game = Game.objects.get(pk=pk)
    except Game.DoesNotExist:
        return Response({"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = GameSerializer(game)
    return Response(serializer.data)

# Update a game (PUT)
@api_view(['PUT'])
def game_update(request, pk):
    try:
        game = Game.objects.get(pk=pk)
    except Game.DoesNotExist:
        return Response({"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = GameSerializer(game, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Delete a game (DELETE)
@api_view(['DELETE'])
def game_delete(request, pk):
    try:
        game = Game.objects.get(pk=pk)
    except Game.DoesNotExist:
        return Response({"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND)
    game.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])

def join_game(request, pk):
    try:
        game = Game.objects.get(pk=pk)
    except Game.DoesNotExist:
        return Response({"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND)
    
    User = get_user_model()
    try:
        default_user = User.objects.get(email='h2berhanu@gmail.com')
    except User.DoesNotExist:
        default_user = User.objects.create_user(
            username = 'h2berhanu',
            email='h2berhanu@gmail.com', 
            name = "Haimanot Berhanu",
            password='dhlcpsc419'
        )
    if game.participant_set.filter(user=request.user).exists():
        return Response({"error": "You have already joined this game"}, status=status.HTTP_400_BAD_REQUEST)
    
    Participant.objects.create(user=request.user, game=game)
    return Response({"message": "Successfully joined the game"}, status=status.HTTP_200_OK)


@api_view(['GET'])
def sport_list(request):
    sports = Sport.objects.all()
    serializer = SportSerializer(sports, many=True)
    return Response(serializer.data)
