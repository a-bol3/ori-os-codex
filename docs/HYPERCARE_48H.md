# Hypercare 48h Checklist

During the first 48 hours after go-live, the team must perform intense monitoring to ensure stability.

## Monitor Schedule (Every 4 Hours)
- [ ] **Error Logs**: Check `docker logs` for API and Web services. Look for 500 errors or unhandled exceptions.
- [ ] **DB Performance**: Check PostgreSQL CPU/Memory usage and connection counts.
- [ ] **Worker Queue**: Ensure `email-send` and other queues are being processed without excessive retries.

## Day 1 Checklist
- [ ] **User Feedback**: Monitor support channels for onboarding friction.
- [ ] **Auth Success Rate**: Verify that all new user registrations are successful.
- [ ] **Third-Party Integrations**: Confirm Webhooks and External APIs (OpenAI, Resend) are responding correctly.

## Day 2 Checklist
- [ ] **Data Integrity**: Verify that CRM activities are correctly linked to contacts and organizations.
- [ ] **Performance Audit**: Use Lighthouse or internal metrics to check dashboard load times in production.
- [ ] **Backup Verification**: Verify that the first automated daily backup was successfully created and stored in S3.

## Resolution Protocol
- Any **P0/P1** issue discovered during hypercare triggers an immediate **Hotfix** or **Rollback** sequence.
