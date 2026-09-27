import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:burgusbroos_flutter/main.dart';
import 'package:burgusbroos_flutter/providers/app_provider.dart';

void main() {
  testWidgets('App renders successfully', (WidgetTester tester) async {
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AppProvider()),
        ],
        child: const BurgusbroosApp(),
      ),
    );

    expect(find.text('Burgusbroos'), findsOneWidget);
  });
}
