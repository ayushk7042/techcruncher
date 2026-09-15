import { ContactInbox } from "@/components/admin/inbox/contact-inbox";
import { AdminPageHeader } from "@/components/admin/ui";

export default function ContactsPage() {
  return (
    <>
      <AdminPageHeader title="Messages" description="Messages sent through the public contact form, newest first." />
      <ContactInbox />
    </>
  );
}
