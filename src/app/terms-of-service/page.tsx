export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 max-w-none">
      <h1 className="text-3xl sm:text-4xl font-black">Terms of Service</h1>
      <p className="text-sm text-app-muted mt-2">Last updated: Today</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using THEREKK, you agree to be bound by these
            Terms of Service. If you do not agree, please do not use the
            service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">2. Eligibility</h2>
          <p>
            You must be at least 13 years old to use THEREKK. By using the
            service, you represent that you meet this age requirement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">3. Account Responsibilities</h2>
          <p>You agree to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Provide accurate registration information</li>
            <li>Keep your password secure</li>
            <li>Be responsible for activity on your account</li>
            <li>Notify us immediately of any unauthorized access</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">4. Content Rules</h2>
          <p>You agree NOT to post content that is:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Illegal, harmful, or fraudulent</li>
            <li>Sexually explicit or pornographic</li>
            <li>Hateful, harassing, or violent</li>
            <li>Infringing on intellectual property rights</li>
            <li>Spam, malware, or phishing</li>
            <li>Misinformation presented as fact</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">5. Your Content</h2>
          <p>
            You retain ownership of content you create. By posting on
            THEREKK, you grant us a worldwide, non-exclusive, royalty-free
            license to host, store, reproduce, and display your content as
            necessary to operate the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">6. Moderation</h2>
          <p>
            We reserve the right to remove content, restrict accounts, or
            take other action at our discretion for violations of these
            terms. We may also act on user reports.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">7. Termination</h2>
          <p>
            We may suspend or terminate your account at any time for
            violation of these terms. You may delete your account at any
            time from Settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">8. Disclaimers</h2>
          <p>
            THEREKK is provided "as is" without warranties of any kind. We
            are not responsible for the accuracy of user-generated content
            or for any damage resulting from repair advice given on the
            platform. Always exercise caution and follow proper safety
            procedures.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, THEREKK shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">10. Changes</h2>
          <p>
            We may update these terms at any time. Continued use of
            THEREKK after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">11. Contact</h2>
          <p>
            For questions about these terms, contact{" "}
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
