import 'package:flutter/material.dart';
import '../../models/notification_model.dart';
import '../../services/notification_service.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  final NotificationService _notificationService = NotificationService();
  List<NotificationModel> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  void _loadNotifications() async {
    final notifications = await _notificationService.getMyNotifications();
    setState(() {
      _notifications = notifications;
      _isLoading = false;
    });
  }

  void _markAsRead(int id) async {
    await _notificationService.markAsRead(id);
    setState(() {
      final index = _notifications.indexWhere((n) => n.id == id);
      if (index != -1) {
        _notifications[index] = NotificationModel(
          id: _notifications[index].id,
          message: _notifications[index].message,
          isRead: true,
          createdAt: _notifications[index].createdAt,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFDF0F5),
      appBar: AppBar(
        backgroundColor: const Color(0xFF9B1D54),
        title: const Text(
          'Notifications',
          style: TextStyle(color: Colors.white),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF9B1D54)),
            )
          : _notifications.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Icon(
                        Icons.notifications_none,
                        size: 60,
                        color: Color(0xFFF48FB1),
                      ),
                      SizedBox(height: 12),
                      Text(
                        'Aucune notification',
                        style: TextStyle(
                          color: Color(0xFF9B1D54),
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _notifications.length,
                  itemBuilder: (context, index) {
                    final notif = _notifications[index];
                    return GestureDetector(
                      onTap: () {
                        if (!notif.isRead && notif.id != null) {
                          _markAsRead(notif.id!);
                        }
                      },
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: notif.isRead
                              ? Colors.white
                              : const Color(0xFFFCE4EC),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: notif.isRead
                                ? Colors.transparent
                                : const Color(0xFFF48FB1),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF9B1D54).withOpacity(0.08),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: notif.isRead
                                    ? const Color(0xFFFDF0F5)
                                    : const Color(0xFF9B1D54),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Icon(
                                Icons.notifications,
                                color: notif.isRead
                                    ? const Color(0xFF9B1D54)
                                    : Colors.white,
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    notif.message,
                                    style: TextStyle(
                                      color: const Color(0xFF2D1B2E),
                                      fontWeight: notif.isRead
                                          ? FontWeight.normal
                                          : FontWeight.bold,
                                    ),
                                  ),
                                  if (notif.createdAt != null) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      '${notif.createdAt!.day}/${notif.createdAt!.month}/${notif.createdAt!.year}',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            if (!notif.isRead)
                              Container(
                                width: 10,
                                height: 10,
                                decoration: const BoxDecoration(
                                  color: Color(0xFF9B1D54),
                                  shape: BoxShape.circle,
                                ),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}