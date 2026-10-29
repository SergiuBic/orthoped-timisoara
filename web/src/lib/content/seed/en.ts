import type { SiteContent } from "../types";

export const en: SiteContent = {
  seo: {
    titleTemplate: "Orthopedic Surgeon {city} – {doctor} | {city} Orthopedics",
    description:
      "Orthopedic surgeon in {city}: knee injuries (ACL, meniscus, cartilage), sports injuries and fractures. Appointments in English, Italian and Romanian.",
    keywords: [
      "{city} orthopedics",
      "orthopedic surgeon {city}",
      "orthopedic doctor {city}",
      "ACL reconstruction {city}",
      "ACL tear treatment {city}",
      "knee arthroscopy {city}",
      "meniscus tear {city}",
      "sports injury doctor {city}",
      "fracture treatment {city}",
      "English-speaking orthopedic surgeon Romania",
      "Italian orthopedic surgeon {city}",
    ],
  },
  hero: {
    eyebrow: "Orthopedics & Traumatology",
    h1: "{city} Orthopedics",
    subtitle:
      "{doctor} treats knee conditions, sports injuries and fractures with a clear, personal plan. Appointments in English, Italian and Romanian.",
    callCta: { label: "Call now" },
    whatsappCta: { label: "WhatsApp" },
    mapsCta: { label: "Directions" },
    highlights: ["Arthroscopic surgery", "Sports injuries", "Trauma care", "EN · IT · RO"],
  },
  trust: {
    items: [
      { value: "MD, MSc, BScN", label: "Medical and university qualifications" },
      { value: "ESSKA", label: "European Society of Sports Traumatology, Knee Surgery & Arthroscopy (member – TODO-DOCTOR verify)" },
      { value: "3", label: "Languages spoken: English, Italian, Romanian" },
      { value: "TODO-DOCTOR", label: "Years of clinical experience" },
    ],
  },
  kneeStory: {
    heading: "Understanding your knee",
    intro:
      "The knee is the most complex joint in the body and one of the hardest working. Here are the structures most often injured, and when it is worth getting a specialist opinion.",
    steps: [
      {
        focus: "overview",
        title: "A complex mechanism",
        text: "The knee combines bone, ligaments, menisci and cartilage working together. Lasting pain, swelling, or a feeling that the knee gives way are good reasons to see an orthopedic specialist.",
      },
      {
        focus: "acl",
        title: "The anterior cruciate ligament (ACL)",
        text: "ACL tears are common in football, skiing and handball, usually from a sudden stop or twist. Typical signs: a pop at the moment of injury, quick swelling and instability. If your knee feels like it slips, book an assessment.",
      },
      {
        focus: "meniscus",
        title: "The meniscus",
        text: "The menisci cushion and stabilize the joint. Tears happen with twisting injuries or from wear, causing pain on the inner or outer side, catching, locking or clicking. Early assessment can help preserve more of the meniscus.",
      },
      {
        focus: "cartilage",
        title: "Articular cartilage",
        text: "Cartilage covers the bone ends so the joint moves smoothly. It does not heal easily by itself. Pain with activity, recurring swelling and a grinding feeling may point to cartilage trouble.",
      },
      {
        focus: "patella",
        title: "The kneecap",
        text: "Pain at the front of the knee, especially on stairs or after sitting for a long time, can come from the kneecap. Dislocations or a kneecap that feels unstable need an orthopedic evaluation.",
      },
    ],
  },
  traumaStory: {
    heading: "Fractures: from injury to recovery",
    intro:
      "A fracture is a break in the bone. Treatment depends on which bone, what kind of break and the patient. Here are the stages in plain language.",
    steps: [
      {
        focus: "intact",
        title: "Healthy bone",
        text: "Bone is living tissue that constantly renews itself and can heal. That ability is the foundation of all fracture treatment.",
      },
      {
        focus: "fracture",
        title: "The fracture",
        text: "After a fall or accident, severe pain, deformity, swelling or being unable to put weight on a limb may signal a fracture. Keep the area still and go to the emergency department or call 112.",
      },
      {
        focus: "reduction",
        title: "Reduction",
        text: "Reduction means bringing the fragments back into the right position, sometimes without surgery, sometimes during an operation. X-rays and, when needed, a CT scan guide the decision.",
      },
      {
        focus: "fixation",
        title: "Fixation",
        text: "When needed, the fragments are held steady with plates, screws or rods so the bone heals in the right position. Other fractures are treated without surgery, with a cast or brace.",
      },
      {
        focus: "healed",
        title: "Healing and rehabilitation",
        text: "Bone usually heals over a few weeks to a few months, depending on the case. Regular follow-up and guided rehabilitation help you regain movement and strength.",
      },
    ],
  },
  services: {
    heading: "Orthopedic and trauma services",
    intro: "Knee conditions, sports injuries and fractures, treated with a personal plan in {city}.",
    items: [
      {
        id: "acl-reconstruction",
        slug: "acl-reconstruction",
        title: "ACL reconstruction",
        summary: "Assessment and treatment of anterior cruciate ligament tears, with non-surgical or surgical options matched to your age and activity.",
        icon: "Activity",
        seoTitle: "ACL Reconstruction {city}",
        body: `## What it is
The anterior cruciate ligament (ACL) keeps the knee stable when you twist or stop suddenly. Tearing it is one of the most common sports injuries.

## Symptoms
- a pop felt at the moment of injury;
- rapid swelling of the knee;
- a feeling of instability or "giving way";
- trouble changing direction or jumping.

## Treatment
The decision depends on age, activity level, how unstable the knee feels and any related damage (meniscus, cartilage). Some patients do well with rehabilitation and muscle strengthening. For people with instability or high sporting demands, ligament reconstruction may be recommended, usually arthroscopic, using a graft from the patient's own tissue. The plan is set after a consultation, clinical examination and imaging.

## Recovery
Recovery is gradual and takes patience: controlling swelling, regaining motion, strengthening, then sport-specific training. Timelines differ from person to person, and return to sport is decided on function, not just the calendar.

## When to call
If your knee swelled after a twist, gives way, or you cannot safely put weight on it, book a consultation as soon as you can. TODO-DOCTOR`,
      },
      {
        id: "meniscus-surgery",
        slug: "meniscus-surgery",
        title: "Meniscus surgery",
        summary: "Diagnosis and treatment of meniscus tears, with a focus on preserving as much of your own tissue as possible.",
        icon: "Bone",
        seoTitle: "Meniscus Tear Treatment {city}",
        body: `## What it is
The menisci are two pads of fibrocartilage in the knee that absorb shock and stabilize the joint. They can be torn by injury or wear down over time.

## Symptoms
- pain on the inner or outer side of the knee;
- catching or locking;
- clicking with movement;
- swelling after activity.

## Treatment
Not every meniscus tear needs surgery. Small, stable or degenerative tears often improve with physiotherapy, activity changes and, if needed, medication. When symptoms persist or the knee mechanically locks, arthroscopic surgery may be advised. Whenever possible, repairing (suturing) the meniscus is preferred so it can be preserved; in other cases only the damaged part is trimmed. The choice depends on the tear type and location, your age and your activity.

## Recovery
After a repair, weight bearing and bending are usually limited for a while and then progress step by step. After a partial trim, recovery is generally quicker. The exact program is individual and is discussed at your consultation.

## When to call
If your knee locks, will not straighten fully, or the pain returns with every twist, ask for an orthopedic assessment. TODO-DOCTOR`,
      },
      {
        id: "knee-arthroscopy",
        slug: "knee-arthroscopy",
        title: "Knee arthroscopy",
        summary: "Minimally invasive keyhole surgery to diagnose and treat problems inside the knee joint.",
        icon: "Microscope",
        seoTitle: "Knee Arthroscopy {city}",
        body: `## What it is
Arthroscopy is a minimally invasive technique in which the surgeon places a slim camera and fine instruments into the joint through small incisions. It allows a direct view and treatment of many problems without opening the knee widely.

## When it is used
- meniscus tears;
- ligament reconstruction;
- cartilage problems;
- loose bodies in the joint;
- some conditions of the kneecap or joint lining.

## Treatment
The procedure takes place in an operating room, usually under regional or general anesthesia chosen together with the anesthetist. Incisions are only a few millimeters. Compared with open surgery, arthroscopy usually means less pain afterwards and faster recovery, but not every condition is suitable. The indication is made after examination and imaging.

## Recovery
Many patients start moving the knee early with a physiotherapy program. The pace depends on what was treated during the operation.

## When to call
If you have knee pain that does not improve with non-surgical care, or repeated locking, book a consultation to discuss whether arthroscopy is an option. TODO-DOCTOR`,
      },
      {
        id: "sports-injuries",
        slug: "sports-injuries",
        title: "Sports injuries",
        summary: "Sprains, ligament tears, muscle and tendon injuries and overuse problems in recreational and competitive athletes.",
        icon: "Dumbbell",
        seoTitle: "Sports Injury Doctor {city}",
        body: `## What they are
Sports injuries include sprains, ligament and meniscus tears, tendon problems, dislocations and stress fractures. They affect competitive athletes and weekend players alike.

## Symptoms
- pain that starts during or after activity;
- swelling, bruising, limited movement;
- joint instability;
- pain that returns every training session.

## Treatment
The first step is an accurate diagnosis through examination and, when needed, X-ray, ultrasound or MRI. Many injuries are managed without surgery: relative rest, braces, physiotherapy and gradual return. Injuries that will not heal on their own, such as some ligament or meniscus tears, may need surgery, often arthroscopic. The plan takes into account your sport and your goals.

## Recovery
Return to sport happens in stages, using functional tests rather than time alone. The aim is not only to get you back, but to lower the risk of another injury.

## When to call
If pain lasts more than a few days, or a joint feels unstable or swollen, stop training and book a consultation. TODO-DOCTOR`,
      },
      {
        id: "fracture-treatment",
        slug: "fracture-treatment",
        title: "Fracture treatment",
        summary: "Assessment and treatment of limb fractures, non-surgical or surgical, with guided rehabilitation.",
        icon: "Bone",
        seoTitle: "Fracture Treatment {city}",
        body: `## What it is
A fracture is a partial or complete break in a bone, most often after a fall, road accident or sports injury. It can be simple or complex, closed or open (when the bone breaks through the skin).

## Symptoms
- sudden, severe pain;
- swelling and bruising;
- a deformed limb;
- being unable to move or bear weight on the area.

## Treatment
Diagnosis is made by examination and X-ray, sometimes with a CT scan. Stable fractures can be treated with a cast, splint or brace. Unstable or displaced fractures, and those involving a joint, are usually treated surgically, with plates, screws or rods holding the bone while it heals. The choice depends on the bone, fracture type, age and general health. Open fractures are emergencies.

## Recovery
Bone typically heals over weeks to months. Follow-up X-rays and physiotherapy help you regain motion, strength and confidence in the limb.

## When to call
If there is obvious deformity, exposed bone, heavy bleeding or numbness in the hand or foot, call 112 immediately. For a suspected fracture without these signs, book a consultation as soon as possible. TODO-DOCTOR`,
      },
      {
        id: "cartilage-repair",
        slug: "cartilage-repair",
        title: "Cartilage injuries and early arthritis",
        summary: "Assessment of knee cartilage damage and treatment options matched to the stage of the problem and your age.",
        icon: "Layers",
        seoTitle: "Knee Cartilage Damage {city}",
        body: `## What it is
Articular cartilage is the smooth layer covering the ends of the bones that lets the joint glide. It can be damaged by injury, instability or wear, and its ability to heal on its own is limited.

## Symptoms
- pain with activity or on stairs;
- recurring swelling;
- grinding or locking sensations;
- morning stiffness.

## Treatment
Treatment depends on the size and location of the damage, your age, limb alignment and symptoms. Many patients benefit from non-surgical measures: physiotherapy, weight management, activity changes and medication. In selected cases, particularly younger patients with a localized defect, surgical techniques to stimulate or restore cartilage may be considered. There is no single solution and results cannot be guaranteed; options are discussed realistically after assessment and imaging.

## Recovery
Recovery is usually gradual, protecting the joint at first and increasing load step by step. The pace depends on the technique used.

## When to call
If knee pain has limited your daily life or sport for several weeks, book an assessment. TODO-DOCTOR`,
      },
    ],
  },
  about: {
    heading: "About {doctor}",
    body: `{doctor} is an Italian-trained orthopedic surgeon practicing in {city}. The focus is knee surgery and conditions (ligaments, meniscus, cartilage, kneecap), sports injuries and trauma.

Holding the titles **MD, MSc, BScN**, {doctor} takes an evidence-based approach and is active in research, which can be seen on the ResearchGate profile. Associated with the **ESSKA** community (European Society of Sports Traumatology, Knee Surgery & Arthroscopy) – TODO-DOCTOR verify membership.

In consultations, {doctor} explains in plain language what is going on, what the options are and what you can realistically expect, without overpromising. Appointments are available in English, Italian or Romanian.

TODO-DOCTOR: add career path (universities, hospitals, training, years of experience).`,
    credentials: ["MD – Doctor of Medicine", "MSc", "BScN", "ESSKA member – TODO-DOCTOR verify", "Clinical research – ResearchGate"],
    languages: ["English", "Italiano", "Română"],
  },
  process: {
    heading: "How it works",
    steps: [
      { title: "Call or message", text: "Phone, WhatsApp or the callback form. We agree on a first appointment together.", icon: "Phone" },
      { title: "First visit and imaging", text: "A conversation, a clinical examination and, if needed, X-ray, ultrasound or MRI.", icon: "Stethoscope" },
      { title: "Your personal plan", text: "Your options, with and without surgery, explained with their benefits and risks.", icon: "ClipboardList" },
      { title: "Recovery and follow-up", text: "A guided rehabilitation program and regular check-ups until you are back to your activities.", icon: "HeartPulse" },
    ],
  },
  faq: {
    heading: "Frequently asked questions",
    items: [
      { q: "Do I need a referral for a consultation?", a: "For a private consultation a referral is usually not required. For details about reimbursement or public-system services, ask when booking. TODO-DOCTOR" },
      { q: "What should I bring to my first visit?", a: "Any previous medical records (MRI reports, X-rays, medical letters), a list of medications, and the imaging disc or files if you have them. Wear clothing that lets the knee or affected area be examined easily." },
      { q: "How long does ACL recovery take?", a: "It varies. Daily activities usually return sooner, while a return to pivoting sports generally takes several months of guided rehabilitation. The exact timeline is set individually." },
      { q: "Arthroscopy or open surgery?", a: "Arthroscopy is minimally invasive and usually allows a faster recovery, but it does not suit every condition. The choice depends on the injury and is discussed after examination and imaging." },
      { q: "When can I get back to sport?", a: "It depends on the injury and treatment. Return is decided by strength, stability and functional tests, not just the time since the injury or operation." },
      { q: "What should I do in an emergency?", a: "If there is obvious deformity, visible bone, heavy bleeding, numbness or unbearable pain after an injury, call 112 immediately or go to the nearest emergency department." },
      { q: "Which languages are consultations in?", a: "English, Italian and Romanian." },
      { q: "Where is the practice in {city}?", a: "The practice is located in {city}. The exact address and a directions button are in the contact section. TODO-DOCTOR verify address." },
    ],
  },
  contact: {
    heading: "Appointments and contact",
    text: "Call, message on WhatsApp, or leave your number and we will get back to you to arrange an appointment in {city}.",
    formTitle: "Request a callback",
    emergencyNote: "Medical emergency? Call 112.",
  },
  legal: {
    medicalDisclaimer:
      "The information on this website is general and educational. It is not a substitute for a medical consultation, diagnosis or treatment. The virtual assistant does not diagnose. In an emergency, call 112.",
    privacyBody: `# Privacy policy

## Data controller
The controller of your personal data is {doctor}. TODO-DOCTOR: add legal name, address and contact details.

## What we collect
- **Callback form:** your name, phone number and, optionally, your message.
- **Virtual assistant:** chat transcripts, kept for **30 days** and then deleted automatically. Please do not enter sensitive medical data in the chat.
- **Anonymous statistics:** visits and clicks on contact buttons, with no cookies and no personal identification. We use an anonymous identifier that changes every day.

## Legal basis and purpose
Form data is processed to contact you and arrange an appointment (Art. 6(1)(b) and (a) GDPR – pre-contractual steps and consent). Anonymous statistics and assistant chats serve to run and improve the website (legitimate interest, Art. 6(1)(f) GDPR).

## Retention
Callback requests – TODO-DOCTOR period. Chat transcripts – 30 days. Statistical events – 13 months.

## Your rights
You have the right of access, rectification, erasure, restriction, objection and portability, and the right to lodge a complaint with the Romanian data protection authority (ANSPDCP).

## Contact
For any request about your data, use the contact details on this site. TODO-DOCTOR`,
  },
};
