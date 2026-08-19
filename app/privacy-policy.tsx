import LegalDocument, { type LegalSection } from '../components/LegalDocument';

const SECTIONS: LegalSection[] = [
  {
    heading: '1. Information We Collect',
    body: [
      'Account information. When you create an account, we collect your email address and password. We do not store your password in plain text.',
      'Profile information. Your name, pronouns, photo, bio, tagline, interests, values, neighborhood, cross streets, time in the area, conversation starters, and any verification badges you choose to add are all supplied by you and visible to other neighbors according to your privacy settings.',
      'Location information. If you grant permission, we use your device’s GPS location to help set your neighborhood and cross streets automatically. We do not store your precise coordinates — only the neighborhood-level information derived from them. You can decline location access, and you can revoke it at any time in your device settings.',
      'Content you create. Posts, comments, replies, reactions, photos, recommendations, listings, alerts, event details, group messages, and direct messages you send through the app.',
      'Communications with other users. Messages, reactions, and shared content within direct messages and group chats are stored so the conversation can be displayed to its participants.',
      'Usage and device information. We may collect basic technical information such as app version, device type, and general usage patterns to help us maintain and improve the app.',
      'Information from others. Other neighbors may mention you, tag you in a photo, endorse a skill, or reference you in content they post.',
    ],
  },
  {
    heading: '2. How We Use Your Information',
    body: [
      'To operate the app: creating your account, displaying your profile, posting your content, delivering messages, and connecting you with nearby neighbors.',
      'To personalize your experience: showing relevant events, recommendations, and neighbors based on your neighborhood, interests, and connections.',
      'To keep the community safe: reviewing reports, enforcing our Terms of Service, and preventing abuse, spam, or fraudulent activity.',
      'To communicate with you: sending notifications you’ve opted into, such as messages, event reminders, and activity on your posts.',
      'To improve the app: understanding how the app is used so we can fix problems and build better features.',
    ],
  },
  {
    heading: '3. How We Share Your Information',
    body: [
      'With other neighbors. Your profile and the content you post are visible to other users of the app, subject to the privacy controls you choose (such as blocking, muting, and friends-only filters).',
      'We do not sell your personal information. We do not share your data with third parties for their own marketing purposes.',
      'Service providers. We may share information with vendors who help us operate the app (such as hosting or infrastructure providers), under obligations to protect your data and use it only to provide services to us.',
      'Legal reasons. We may disclose information if required by law, or if we believe in good faith that disclosure is necessary to protect the rights, property, or safety of Neighbor, our users, or the public.',
      'With your consent. We may share information in other ways if you direct us to or explicitly agree.',
    ],
  },
  {
    heading: '4. Your Privacy Choices',
    body: [
      'Access and export. You can download a copy of your profile data at any time from Settings → Privacy → Export my data.',
      'Delete your account. You can permanently delete your account from Settings → Account → Delete account. This removes your profile and cannot be undone.',
      'Block and mute. You can block or mute any neighbor to stop seeing their content or prevent them from contacting you, from Settings or their profile.',
      'Location. Location access is optional and only used when you choose to set your neighborhood from your current location. You can deny or revoke this permission in your device settings at any time.',
      'Notifications. You can control which types of notifications you receive, and set quiet hours, from Settings → Notifications.',
      'Read receipts. You can turn off read receipts for group messages from Settings → Privacy.',
    ],
  },
  {
    heading: '5. Data Retention',
    body: [
      'We retain your information for as long as your account is active. If you delete your account, we remove your profile and associated content, except where retention is required to comply with legal obligations, resolve disputes, or enforce our agreements.',
    ],
  },
  {
    heading: '6. Data Security',
    body: [
      'We use reasonable administrative, technical, and physical safeguards designed to protect your information. No method of transmission or storage is completely secure, so we can’t guarantee absolute security.',
    ],
  },
  {
    heading: '7. Children’s Privacy',
    body: [
      'Neighbor is intended for adults and is not directed at children under 16. We do not knowingly collect personal information from children under 16. If you believe a child has provided us with personal information, please contact us so we can remove it.',
    ],
  },
  {
    heading: '8. Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. If we make material changes, we’ll let you know through the app or by other reasonable means before the changes take effect.',
    ],
  },
  {
    heading: '9. Contact Us',
    body: [
      'If you have questions about this Privacy Policy or how your information is handled, reach out through Settings → Support → Send feedback.',
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalDocument
      title="Privacy Policy"
      lastUpdated="August 18, 2026"
      intro="This Privacy Policy describes how Neighbor collects, uses, and shares information when you use our app. By using Neighbor, you agree to the collection and use of information as described here."
      sections={SECTIONS}
    />
  );
}
