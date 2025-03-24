from django.db import models

# Create your models here.
from django.db import models


class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=255, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Users"


class Sport(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Game(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('full', 'Full'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    SKILL_LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('all', 'All Levels'),
    ]

    creator = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='created_games')
    location = models.CharField(max_length=100)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='open')
    skill_level = models.CharField(
        max_length=20, choices=SKILL_LEVEL_CHOICES, default='all')
    sport = models.ForeignKey(
        Sport, on_delete=models.CASCADE, related_name='games')

    def __str__(self):
        return f"{self.sport} at {self.location} on {self.start_time.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        verbose_name_plural = "Games"
        ordering = ['start_time']


class Participant(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='games_joined')
    game = models.ForeignKey(
        Game, on_delete=models.CASCADE, related_name='participants')

    def __str__(self):
        return f"{self.user.name} in {self.game}"

    class Meta:
        verbose_name_plural = "Participants"
        unique_together = ('user', 'game')
        # This enforces the PRIMARY KEY constraint from the SQL schema