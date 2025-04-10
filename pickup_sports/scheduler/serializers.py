from rest_framework import serializers
from .models import CustomUser, Sport, Game, Participant
from django.conf import settings

# Serializer for CustomUser


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'email']
        read_only_fields = ['id']

# Serializer for Sport


class SportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sport
        fields = ['id', 'name']
        read_only_fields = ['id']

# Serializer for updating user profiles


class CustomUserProfileUpdateSerializer(serializers.ModelSerializer):
    favorite_sports = serializers.PrimaryKeyRelatedField(
        queryset=Sport.objects.all(),
        many=True,
        required=False
    )
    email = serializers.EmailField(required=False)  # Allow updating email

    class Meta:
        model = CustomUser
        fields = ['name', 'email', 'bio', 'favorite_sports']


# Serializer for User Profile
class UserProfileSerializer(serializers.ModelSerializer):
    favorite_sports = SportSerializer(many=True, read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'name', 'bio', 'favorite_sports']

# Serializer for Participant (junction table)


class ParticipantSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True) 

    class Meta:
        model = Participant
        fields = ['id', 'user']
        read_only_fields = ['id']

# Serializer for Game


class GameSerializer(serializers.ModelSerializer):
    creator = CustomUserSerializer(read_only=True)  
    sport = SportSerializer(read_only=True)  
    participants = ParticipantSerializer(
        source='participant_set', many=True, read_only=True)  
    sport_id = serializers.PrimaryKeyRelatedField(
        queryset=Sport.objects.all(), source='sport', write_only=True
    )

    class Meta:
        model = Game
        fields = ['id', 'creator', 'location', 'participants', 'start_time', 'end_time',
                  'status', 'skill_level', 'sport', 'sport_id']
        read_only_fields = ['id', 'creator', 'participants', 'sport']
