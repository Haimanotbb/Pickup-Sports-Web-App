from rest_framework import serializers
from .models import CustomUser, Sport, Game, Participant
from django.conf import settings

# Serializer for CustomUser
class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'email']  # Include fields you want in API
        read_only_fields = ['id']  # id is auto-generated, read-only

# Serializer for Sport
class SportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sport
        fields = ['id', 'name']
        read_only_fields = ['id']

# Serializer for Participant (junction table)
class ParticipantSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)  # Nested user details

    class Meta:
        model = Participant
        fields = ['id', 'user']
        read_only_fields = ['id']  # game is set via the relationship

# Serializer for Game
class GameSerializer(serializers.ModelSerializer):
    creator = CustomUserSerializer(read_only=True)  # Nested creator details
    sport = SportSerializer(read_only=True)  # Nested sport details
    participants = ParticipantSerializer(source='participant_set',many=True, read_only=True)  # Nested list of participants

    class Meta:
        model = Game
        fields = ['id', 'creator', 'location', 'participants', 'start_time', 'end_time', 
                  'status', 'skill_level', 'sport']
        read_only_fields = ['id', 'creator', 'participants']  # Auto-set fields