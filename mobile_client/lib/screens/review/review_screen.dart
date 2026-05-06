import 'package:flutter/material.dart';
import '../../models/review_model.dart';
import '../../services/review_service.dart';

class ReviewScreen extends StatefulWidget {
  final int appointmentId;
  const ReviewScreen({super.key, required this.appointmentId});

  @override
  State<ReviewScreen> createState() => _ReviewScreenState();
}

class _ReviewScreenState extends State<ReviewScreen> {
  final ReviewService _reviewService = ReviewService();
  final _commentController = TextEditingController();
  int _rating = 0;
  bool _isLoading = false;

  void _submit() async {
    if (_rating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez choisir une note'),
          backgroundColor: Color(0xFFC62828),
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    final review = ReviewModel(
      rating: _rating,
      comment: _commentController.text.trim(),
      appointmentId: widget.appointmentId,
    );

    final success = await _reviewService.createReview(review);
    setState(() => _isLoading = false);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Avis envoyé avec succès ! ⭐'),
          backgroundColor: Color(0xFF00897B),
        ),
      );
      Navigator.pop(context);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Erreur lors de l\'envoi'),
          backgroundColor: Color(0xFFC62828),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFDF0F5),
      appBar: AppBar(
        backgroundColor: const Color(0xFF9B1D54),
        title: const Text(
          'Laisser un avis',
          style: TextStyle(color: Colors.white),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 20),

            const Text(
              'Comment s\'est passée votre intervention ?',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF2D1B2E),
              ),
            ),

            const SizedBox(height: 32),

            // Étoiles
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                return GestureDetector(
                  onTap: () => setState(() => _rating = index + 1),
                  child: Icon(
                    index < _rating ? Icons.star : Icons.star_border,
                    size: 48,
                    color: const Color(0xFFFFB300),
                  ),
                );
              }),
            ),

            const SizedBox(height: 8),

            Text(
              _rating == 0
                  ? 'Touchez une étoile'
                  : _rating == 1
                      ? 'Très mauvais 😞'
                      : _rating == 2
                          ? 'Mauvais 😐'
                          : _rating == 3
                              ? 'Correct 🙂'
                              : _rating == 4
                                  ? 'Bien 😊'
                                  : 'Excellent ! 🌟',
              style: TextStyle(
                fontSize: 16,
                color: _rating == 0
                    ? Colors.grey
                    : const Color(0xFF9B1D54),
                fontWeight: FontWeight.w500,
              ),
            ),

            const SizedBox(height: 32),

            // Commentaire
            TextFormField(
              controller: _commentController,
              maxLines: 4,
              decoration: InputDecoration(
                labelText: 'Commentaire (optionnel)',
                hintText: 'Décrivez votre expérience...',
                labelStyle: const TextStyle(color: Color(0xFF9B1D54)),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFF48FB1)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                      color: Color(0xFF9B1D54), width: 2),
                ),
                filled: true,
                fillColor: const Color(0xFFFDF0F5),
              ),
            ),

            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF9B1D54),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        'Envoyer mon avis',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}