# scheduler/tests/test_views.py

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from ..models import Sport, Game, Participant

User = get_user_model()


class GameAPITests(TestCase):
    """
    Tests for the Game API endpoints: list, create, join, leave, cancel, delete.
    """

    def setUp(self):
        # Create and authenticate as "bob"
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="bob",
            email="bob@example.com",
            password="pw"
        )
        self.client.force_authenticate(self.user)

        # A sport to use in game creation
        self.sport = Sport.objects.create(name="Basketball")

    def test_list_games_public(self):
        """
        GET /api/games/ should be accessible without auth and return 200.
        """
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
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        game = Game.objects.get(name="Morning Shootaround")
        self.assertEqual(game.creator, self.user)
        self.assertEqual(game.sport, self.sport)

    def test_join_and_leave_game(self):
        """
        POST /api/games/<pk>/join/ and /leave/ should add/remove Participant.
        """
        # Game created by bob
        game = Game.objects.create(
            name="Pickup Game",
            creator=self.user,
            sport=self.sport,
            location="Court",
            start_time=timezone.now() + timedelta(hours=1),
            end_time=timezone.now() + timedelta(hours=2),
            skill_level="all"
        )

        # Switch to a non-creator user "carol"
        other = User.objects.create_user(
            username="carol",
            email="carol@example.com",
            password="pw2"
        )
        self.client.force_authenticate(other)

        # Join
        join_url = reverse('join_game', kwargs={'pk': game.pk})
        resp1 = self.client.post(join_url)
        self.assertEqual(resp1.status_code, status.HTTP_200_OK)
        self.assertTrue(Participant.objects.filter(
            user=other, game=game).exists())

        # Join again → 400
        resp2 = self.client.post(join_url)
        self.assertEqual(resp2.status_code, status.HTTP_400_BAD_REQUEST)

        # Leave
        leave_url = reverse('leave-game', kwargs={'pk': game.pk})
        resp3 = self.client.post(leave_url)
        self.assertEqual(resp3.status_code, status.HTTP_200_OK)
        self.assertFalse(Participant.objects.filter(
            user=other, game=game).exists())

    def test_cancel_and_delete_permissions(self):
        """
        Only creator can cancel or delete; others get 403.
        """
        # Game created by bob
        game = Game.objects.create(
            name="Evening Match",
            creator=self.user,
            sport=self.sport,
            location="Field B",
            start_time=timezone.now() + timedelta(hours=3),
            end_time=timezone.now() + timedelta(hours=4),
            skill_level="all"
        )

        # Switch to another user "dave"
        other = User.objects.create_user(
            username="dave",
            email="dave@example.com",
            password="pw3"
        )
        self.client.force_authenticate(other)

        # Attempt cancel → 403
        cancel_url = reverse('cancel_game', kwargs={'pk': game.pk})
        resp_cancel = self.client.post(cancel_url)
        self.assertEqual(resp_cancel.status_code, status.HTTP_403_FORBIDDEN)

        # Attempt delete → 403
        delete_url = reverse('game_delete', kwargs={'pk': game.pk})
        resp_delete = self.client.delete(delete_url)
        self.assertEqual(resp_delete.status_code, status.HTTP_403_FORBIDDEN)
