from rest_framework import serializers
from .models import CustomUser, Sport, Game, Participant, Comment
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

# serializer for comments section
class CommentSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    author_name     = serializers.ReadOnlyField(source='author.name')

    class Meta:
        model = Comment
        fields = ['id', 'game', 'author', 'author_name', 'text', 'created']
        read_only_fields = ['id', 'author_username', 'created']

# Serializer for Game
class GameSerializer(serializers.ModelSerializer):
    creator = CustomUserSerializer(read_only=True)
    sport    = SportSerializer(read_only=True)
    participants = ParticipantSerializer(source='participant_set', many=True, read_only=True)
    sport_id = serializers.PrimaryKeyRelatedField(
        queryset=Sport.objects.all(), source='sport', write_only=True
    )
    current_state = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    capacity = serializers.IntegerField(
      min_value=1, allow_null=True, required=False,
      error_messages={'min_value': 'Capacity must be at least 1.'}
    )

    class Meta:
        model = Game

        fields = [
            'id',
            'name',             
            'creator',
            'location',
            'participants',
            'start_time',
            'end_time',
            'status',
            'skill_level',
            'sport',
            'sport_id',
            'current_state',  
            'comments',
            'capacity',
        ]
        read_only_fields = ['id', 'creator', 'participants', 'sport', 'current_state','comments']

    def get_current_state(self, obj):
        return obj.current_state()

