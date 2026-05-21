import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (<div className="min-h-screen bg-background">
      <Navbar />
      <section className="container py-20">
        <div className="grid lg:grid-cols-[1.4fr_0.9fr] gap-10">
          <div>
            <h1 className="text-4xl font-bold">Get in touch with SmartPlacement</h1>
            <p className="mt-4 text-muted-foreground font-body max-w-2xl">Whether you are a student, recruiter or placement officer, our team is ready to support your campus hiring journey.</p>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border bg-card p-6">
                <div className="inline-flex items-center justify-center rounded-2xl bg-primary/10 p-3 text-primary mb-4">
                  <Mail className="h-5 w-5" />
                </div>
                <h2 className="font-semibold">Email support</h2>
                <p className="mt-2 text-sm text-muted-foreground">contact@smartplacement.com</p>
              </div>
              <div className="rounded-3xl border bg-card p-6">
                <div className="inline-flex items-center justify-center rounded-2xl bg-primary/10 p-3 text-primary mb-4">
                  <Phone className="h-5 w-5" />
                </div>
                <h2 className="font-semibold">Call us</h2>
                <p className="mt-2 text-sm text-muted-foreground">+91 98765 43210</p>
              </div>
              <div className="rounded-3xl border bg-card p-6">
                <div className="inline-flex items-center justify-center rounded-2xl bg-primary/10 p-3 text-primary mb-4">
                  <MapPin className="h-5 w-5" />
                </div>
                <h2 className="font-semibold">Location</h2>
                <p className="mt-2 text-sm text-muted-foreground">Mumbai, India</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-8">
            <h2 className="text-2xl font-semibold mb-4">Send us a message</h2>
            {sent ? (<div className="rounded-3xl bg-emerald-100 p-6 text-emerald-900">Thanks! Your message has been sent. We’ll get back to you soon.</div>) : (<form onSubmit={handleSubmit} className="space-y-4">
                  <label className="flex flex-col gap-2 text-sm text-muted-foreground">
                    Name
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-muted-foreground">
                    Email
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-muted-foreground">
                    Message
                    <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" rows={6} required />
                  </label>
                  <Button type="submit" className="w-full">Send message</Button>
                </form>)}
          </div>
        </div>
      </section>
    </div>);
}
