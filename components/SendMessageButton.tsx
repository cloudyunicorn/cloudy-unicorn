"use client";

import { Button } from "@/components/ui/button";

export default function SendMessageButton() {
  const handleClick = () => {
    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    const subject = (document.getElementById('subject') as HTMLInputElement)?.value;
    const body = (document.getElementById('message') as HTMLTextAreaElement)?.value;
    
    if (email && subject && body) {
      window.location.href = `mailto:s.rajat55@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + '\n\nFrom: ' + email)}`;
    }
  };

  return (
    <Button className="w-full" onClick={handleClick}>
      Send Message
    </Button>
  );
}
