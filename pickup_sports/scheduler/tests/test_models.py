from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from datetime import timedelta
from ..models import Sport, Game, Participant

User = get_user_model()


class GameModelTests(TestCase):
    """
    Tests for the Game.current_state() method.
    """

    def setUp(self):
        # create a sport and a user
        self.sport = Sport.objects.create(name="Soccer")
        self.user = User.objects.create_user(username="alice", password="pw")

    def test_current_state_open_and_completed(self):
        # 1) Create a game that starts & ends in the future → state should be "Open"
        future_start = timezone.now() + timedelta(hours=1)
        game = Game.objects.create(
            name="Future Game",
            creator=self.user,
            sport=self.sport,
            location="Field",
            start_time=future_start,
            end_time=future_start + timedelta(hours=2),
            skill_level="all",
        )
        self.assertEqual(game.current_state(), "Open")

        # 2) Move end_time to past → state should be "Completed"
        game.start_time = timezone.now() - timedelta(hours=2)
        game.end_time = timezone.now() - timedelta(minutes=5)
        game.save()
        self.assertEqual(game.current_state(), "Completed")
