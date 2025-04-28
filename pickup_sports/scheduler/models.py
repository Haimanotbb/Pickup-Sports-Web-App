from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    email = models.EmailField('email address', unique=True)
    name = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    favorite_sports = models.ManyToManyField(
        'Sport', related_name='favorite_users', blank=True)

    def __str__(self):
        return self.email or self.username or f"User {self.pk}"

    class Meta:
        db_table = 'users'


class Sport(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Game(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('cancelled', 'Cancelled'),
    ]

    SKILL_LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('all', 'All Levels'),
    ]
    
    name = models.CharField(max_length=200, blank=True)
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_games')
    location = models.CharField(max_length=100)

    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='Participant',
        related_name='joined_games'
    )

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
    
    def current_state(self):
        now = timezone.now()
        if self.status == "cancelled":
            if now < self.end_time:
                return "cancelled"
            else:
                return "cancelled"
        else:
            if now < self.start_time:
                return "Open"
            elif self.start_time <= now <= self.end_time:
                return "In_progress"
            else:
                return "Completed"
    class Meta:
        verbose_name_plural = "Games"
        ordering = ['start_time']


class Participant(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='participations'
    )
    game = models.ForeignKey(
        Game,
        on_delete=models.CASCADE, related_name='participant_set'
    )

    def __str__(self):
        return f"{self.user.name} in {self.game}"

    class Meta:
        unique_together = ('user', 'game')
