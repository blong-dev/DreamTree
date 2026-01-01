I need to implement a complete onboarding flow for DreamTree. Here are the exact requirements:

**Note:** This onboarding leads into the main DreamTree course based on "The Dream Tree" by Braedon Long. Full course content available in `AA source material/DreamTreeTXT.txt` and supporting files.
Onboarding Flow Structure
Step 1: Aesthetic Preferences (First thing on initial sign-in)
Create a preferences setup page where users choose:

Background color
Font family
Font color

Store these in localStorage and apply them globally to the chat interface.
Step 2: Conversational Onboarding with "Bee"
After preferences are set, begin a conversational onboarding using a screenplay/play format. ALL dialogue should be left-aligned with speaker labels like this:
Bee: Hi! I'm Bee 🐝 I'll be your guide here at DreamTree. What should I call you?

[User input field]

Bee: It's great to meet you, {customer_name}! I'm an AI agent tasked with helping you find your dream job.

Bee: Quick question - do you care about how your data is being stored here?

[User responds yes/no or types]

// If yes:
Bee: Great question! Here at DreamTree, YOU own your data. Everything is encrypted with your wallet signature...

// If no:
Bee: No problem! Let's move forward.

Bee: Before we dive in, let me give you the lay of the land. This course is structured like a tree...

Bee: We have 3 Parts (Roots, Trunk, Branches), each containing multiple Modules, and each Module has several Exercises.

Bee: You can ask me questions at any point - just type and I'll help clarify anything!

Bee: Ready to start with Module 1?
Step 3: Flow into Module 1
Once onboarding is complete, transition directly into the first exercise of Module 1.
Technical Requirements

Chat Interface Styling:

Plain aesthetic with user's chosen colors applied
Screenplay format: left-aligned text with "Speaker:" labels
One background, words on the page
Apply user's font and color preferences throughout


Data Collection (conversational, natural flow):

typescript   interface UserProfile {
     name: string;
     theme: {
       backgroundColor: string;
       fontFamily: string;
       fontColor: string;
     };
     dataOwnershipExplained: boolean;
     consentTimestamp: number;
   }

Navigation:

At any point during exercises, user can type a question and we answer it
Need nav capability once we reach Module 1


Tone:

Conversational, friendly, human
Set the tone for the entire experience through how Bee interacts