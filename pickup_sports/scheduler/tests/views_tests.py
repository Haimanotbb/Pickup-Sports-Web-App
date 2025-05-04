from django.test import TestCase

# Create your tests here.
# scheduler/tests.py

from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from datetime import timedelta

from .models import Sport, Game, Participant

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
        game.end_time = timezone.now() - timedelta(minutes=5)
        game.save()
        self.assertEqual(game.current_state(), "Completed")


class GameAPITests(TestCase):
    """
    Tests for the Game API endpoints: list, create, join, leave, cancel, delete.
    """

    def setUp(self):
        # Set up a user, sport, client, and authenticate
        self.client = APIClient()
        self.user = User.objects.create_user(username="bob", password="pw")
        self.client.force_authenticate(self.user)

        self.sport = Sport.objects.create(name="Basketball")

    def test_list_games_public(self):
        """
        GET /api/games/ should be accessible without auth and return 200.
        """
        # logout to test anonymously
        self.client.force_authenticate(user=None)
        url = reverse('game_list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_game_and_auto_creator(self):
        """
        POST /api/games/create/ should create a game with the logged-in user as creator.
        """
        url = reverse('game_create')
        payload = {
            "name": "Morning Shootaround",
            "sport_id": self.sport.id,
            "location": "Gym",
            "start_time": (timezone.now() + timedelta(hours=2)).isoformat(),
            "end_time":   (timezone.now() + timedelta(hours=3)).isoformat(),
            "skill_level": "all"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        game = Game.objects.get(name="Morning Shootaround")
        self.assertEqual(game.creator, self.user)
        self.assertEqual(game.sport, self.sport)

    def test_join_and_leave_game(self):
        """
        POST /api/games/<pk>/join/ and /leave/ should add/remove Participant.
        """
        # first create a game by bob
        game = Game.objects.create(
            name="Pickup Game",
            creator=self.user,
            sport=self.sport,
            location="Court",
            start_time=timezone.now() + timedelta(hours=1),
            end_time=timezone.now() + timedelta(hours=2),
            skill_level="all"
        )

        join_url = reverse('join_game', kwargs={'pk': game.pk})
        # join once → 200 OK + Participant exists
        resp1 = self.client.post(join_url)
        self.assertEqual(resp1.status_code, status.HTTP_200_OK)
        self.assertTrue(Participant.objects.filter(user=self.user, game=game).exists())

        # join again → 400 Bad Request (already joined)
        resp2 = self.client.post(join_url)
        self.assertEqual(resp2.status_code, status.HTTP_400_BAD_REQUEST)

        leave_url = reverse('leave-game', kwargs={'pk': game.pk})
        # leave → 200 OK + Participant removed
        resp3 = self.client.post(leave_url)
        self.assertEqual(resp3.status_code, status.HTTP_200_OK)
        self.assertFalse(Participant.objects.filter(user=self.user, game=game).exists())

    def test_cancel_and_delete_permissions(self):
        """
        Only creator can cancel or delete; others get 403.
        """
        # bob creates a game
        game = Game.objects.create(
            name="Evening Match",
            creator=self.user,
            sport=self.sport,
            location="Field B",
            start_time=timezone.now() + timedelta(hours=3),
            end_time=timezone.now() + timedelta(hours=4),
            skill_level="all"
        )

        # create a second user and authenticate as them
        other = User.objects.create_user(username="carol", password="pw2")
        self.client.force_authenticate(other)

        cancel_url = reverse('cancel_game', kwargs={'pk': game.pk})
        resp_cancel = self.client.post(cancel_url)
        self.assertEqual(resp_cancel.status_code, status.HTTP_403_FORBIDDEN)

        delete_url = reverse('game_delete', kwargs={'pk': game.pk})
        resp_delete = self.client.delete(delete_url)
        self.assertEqual(resp_delete.status_code, status.HTTP_403_FORBIDDEN)
