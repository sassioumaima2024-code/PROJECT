import 'package:flutter_test/flutter_test.dart';

import 'package:mobile_prestataire/main.dart';

void main() {
  testWidgets('Prestataire registration screen smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const ServicyApp());

    expect(find.text('Inscription Prestataire'), findsOneWidget);
    expect(find.text('Nom commercial'), findsOneWidget);
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Telephone (+216)'), findsOneWidget);

    expect(find.text('Continuer'), findsOneWidget);
  });
}
