export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 prose dark:prose-invert max-w-none">
      <h1 className="text-3xl sm:text-4xl font-black">Privacy Policy</h1>
      <p className="text-sm text-app-muted mt-2">Last updated: Today</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-2">1. Introduction</h2>
          <p>
            Welcome to THEREKK ("we", "our", "us"). We respect your privacy
            and are committed to protecting your personal data. This privacy
            policy will inform you about how we look after your personal data
            when you visit our website and tell you about your privacy rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              <strong>Account Information:</strong> When you sign up, we collect
              your email, username, display name, and profile picture.
            </li>
            <li>
              <strong>Content:</strong> Videos, posts, comments, and other
              content you upload or create on the platform.
            </li>
            <li>
              <strong>Usage Data:</strong> Information about how you use
              THEREKK, including pages visited, time spent, and interactions.
            </li>
            <li>
              <strong>Device Information:</strong> Browser type, IP address,
              device type, and operating system.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Provide, maintain, and improve our services</li>
            <li>Personalize your experience (e.g., "For You" feed)</li>
            <li>Send you notifications about activity on your content</li>
            <li>Detect and prevent abuse, spam, or fraud</li>
            <li>Respond to your inquiries and support requests</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">4. Data Storage & Security</h2>
          <p>
            Your data is stored securely using industry-standard encryption
            and security practices. We use Supabase for database storage and
            Telegram for video file storage. Access to personal data is
            restricted to authorized personnel only.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">5. Sharing of Your Information</h2>
          <p>
            We do not sell your personal data. We may share data with:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Service providers (hosting, email delivery)</li>
            <li>Law enforcement if required by law</li>
            <li>Other users, as per your privacy settings</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate or incomplete data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">7. Cookies</h2>
          <p>
            We use essential cookies for authentication and session
            management. You can disable cookies in your browser settings,
            but this may affect site functionality.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">8. Children's Privacy</h2>
          <p>
            THEREKK is not intended for users under 13. We do not knowingly
            collect data from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">9. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. We will notify you
            of significant changes via email or in-app notification.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">10. Contact Us</h2>
          <p>
            For privacy questions, contact us at{" "}
            <a
              href="mailto:therekk.in@gmail.com"
              className="text-primary hover:underline"
            >
              therekk.in@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
