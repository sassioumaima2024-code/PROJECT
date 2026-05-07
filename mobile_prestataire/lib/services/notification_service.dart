import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';

class NotificationService {
  static final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  static Future<void> init() async {
    const InitializationSettings initializationSettings =
        InitializationSettings(
      android: AndroidInitializationSettings('@mipmap/ic_launcher'),
      iOS: DarwinInitializationSettings(),
    );

    await _notificationsPlugin.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: _onNotificationTap,
    );

    await FirebaseMessaging.instance.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      provisional: false,
      sound: true,

    );

  }

  static Future<void> showNotification({
    required String title,
    required String body,
    Map<String, dynamic>? payload,
  }) async {
    const AndroidNotificationDetails androidDetails =
        AndroidNotificationDetails(
      'servicy_notifications',
      'SERVICY Notifications',
      channelDescription: 'Notifications pour SERVICY',
      importance: Importance.max,
      priority: Priority.high,
      enableVibration: true,
      playSound: true,
    );

    const DarwinNotificationDetails iosDetails =
        DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const NotificationDetails notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notificationsPlugin.show(
      DateTime.now().millisecondsSinceEpoch.remainder(100000),
      title,
      body,
      notificationDetails,
      payload: payload != null ? _encodePayload(payload) : null,
    );
  }

  static Future<void> handleBackgroundMessage(RemoteMessage message) async {
    print('Handling background message: ${message.messageId}');
    await showNotification(
      title: message.notification?.title ?? 'Notification SERVICY',
      body: message.notification?.body ?? 'Nouvelle notification',
      payload: message.data,
    );
  }

  static Future<void> handleForegroundMessage(RemoteMessage message) async {
    print('Handling foreground message: ${message.messageId}');
    if (message.notification != null) {
      await showNotification(
        title: message.notification!.title ?? 'Notification SERVICY',
        body: message.notification!.body ?? 'Nouvelle notification',
        payload: message.data,
      );
    }
  }

  static void handleNotificationTap(Map<String, dynamic> payload) {
    String? type = payload['type'];

    switch (type) {
      case 'new_appointment':
        navigateTo('/agenda');
        break;
      case 'accepted':
      case 'refused':
      case 'alternative':
        navigateTo('/agenda');

        break;
      case 'warning':
      case 'suspended':
        navigateTo('/profile');

        break;
      default:
        navigateTo('/dashboard');
    }
  }

  static void _onNotificationTap(NotificationResponse response) {
    if (response.payload != null) {
      try {
        final Map<String, dynamic> payload =
            _decodePayload(response.payload!);
        handleNotificationTap(payload);
      } catch (e) {
        print('Error parsing notification payload: $e');
      }
    }
  }

  static String _encodePayload(Map<String, dynamic> payload) {
    return payload.entries
        .map((e) => '${e.key}=${e.value}')
        .join('&');
  }

  static Map<String, dynamic> _decodePayload(String payload) {
    Map<String, dynamic> result = {};

    payload.split('&').forEach((element) {
      final parts = element.split('=');
      if (parts.length == 2) {
        result[parts[0]] = parts[1];
      }
    });
    return result;
  }

  static void navigateTo(String route) {
  }

}
