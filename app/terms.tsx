import LegalDocument, { type LegalSection } from '../components/LegalDocument';

const SECTIONS: LegalSection[] = [
  {
    heading: '1. Acceptance of Terms',
    body: [
      'By creating an account or using Neighbor, you agree to be bound by these Terms of Service and our Privacy Policy. If you don’t agree, please don’t use the app.',
    ],
  },
  {
    heading: '2. Description of Service',
    body: [
      'Neighbor is a community app that helps people connect with the neighbors around them — through posts, events, recommendations, a borrow-and-lend board, a for-sale board, neighborhood alerts, groups, and messaging. Features and functionality may change over time as we improve the app.',
    ],
  },
  {
    heading: '3. Eligibility and Your Account',
    body: [
      'You must be at least 16 years old to use Neighbor. You’re responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.',
      'You agree to provide accurate information, including a genuine representation of your neighborhood — misrepresenting your location undermines the trust the community depends on.',
      'You may delete your account at any time from Settings → Account → Delete account.',
    ],
  },
  {
    heading: '4. Community Guidelines',
    body: [
      'Neighbor works because people show up as themselves and treat each other with care. When using the app, you agree to:',
      '• Be respectful. No harassment, hate speech, threats, or bullying of other neighbors.',
      '• Be honest. Don’t impersonate someone else, create a fake profile, or misrepresent who you are or where you live.',
      '• Keep it safe. Don’t post content that is illegal, obscene, or that could put a neighbor’s safety at risk.',
      '• Respect privacy. Don’t share another person’s private information without their consent.',
      '• No spam. Don’t use the app to advertise unrelated products or services, or to send unsolicited bulk messages.',
      'We rely on the Report feature throughout the app to flag content or accounts that don’t meet these guidelines. We may review reports and take action, including removing content, restricting features, or suspending an account.',
    ],
  },
  {
    heading: '5. Your Content',
    body: [
      'You retain ownership of the posts, photos, comments, and other content you create and share on Neighbor ("Your Content").',
      'By posting Your Content, you grant Neighbor a non-exclusive, worldwide, royalty-free license to host, store, display, and distribute it solely for the purpose of operating and providing the app to you and the neighbors you share it with.',
      'You’re responsible for Your Content and confirm you have the rights necessary to post it.',
    ],
  },
  {
    heading: '6. Prohibited Activities',
    body: [
      'In addition to the Community Guidelines above, you agree not to: reverse-engineer or interfere with the app; attempt to access another user’s account without authorization; use automated means (bots, scrapers) to access the app; upload malicious code; or use the app for any unlawful purpose.',
    ],
  },
  {
    heading: '7. Reporting and Enforcement',
    body: [
      'If you see content or behavior that violates these Terms, please report it using the in-app Report feature or by contacting us through Settings → Support → Send feedback. We may investigate and take appropriate action at our discretion, up to and including account termination.',
    ],
  },
  {
    heading: '8. Termination',
    body: [
      'You may stop using Neighbor and delete your account at any time. We may suspend or terminate your access to the app if we believe, in good faith, that you’ve violated these Terms or put the safety of the community at risk.',
    ],
  },
  {
    heading: '9. Disclaimers',
    body: [
      'Neighbor is provided "as is" without warranties of any kind, express or implied. We don’t guarantee that the app will be uninterrupted, error-free, or that content shared by other users is accurate, safe, or reliable. Interactions with other neighbors — online or in person — are at your own discretion and risk.',
    ],
  },
  {
    heading: '10. Limitation of Liability',
    body: [
      'To the fullest extent permitted by law, Neighbor and its team will not be liable for any indirect, incidental, special, or consequential damages arising from your use of the app, or from interactions with other users facilitated by the app.',
    ],
  },
  {
    heading: '11. Changes to These Terms',
    body: [
      'We may update these Terms from time to time. If we make material changes, we’ll provide reasonable notice through the app before the changes take effect. Continued use of Neighbor after changes take effect means you accept the updated Terms.',
    ],
  },
  {
    heading: '12. Contact Us',
    body: [
      'Questions about these Terms can be sent through Settings → Support → Send feedback.',
    ],
  },
];

export default function Terms() {
  return (
    <LegalDocument
      title="Terms of Service"
      lastUpdated="August 18, 2026"
      intro="These Terms of Service govern your use of Neighbor. Please read them carefully — they explain what you can expect from us, and what we expect from you as part of this community."
      sections={SECTIONS}
    />
  );
}
