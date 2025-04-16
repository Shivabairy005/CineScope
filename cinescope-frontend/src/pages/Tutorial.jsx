import { useState } from "react";

const tutorials = {
  "Camera Movements": [
    {
      title: "Pan",
      description: "Horizontal movement from a fixed axis — camera pans left to right.",
      url: "https://www.youtube.com/embed/avdpM1cvWcI"
    },
    {
      title: "Tilt",
      description: "Camera tilts vertically up or down while staying in place.",
      url: "https://www.youtube.com/embed/3blhXQ_cU_E"
    },
    {
      title: "Zoom",
      description: "Zooming in/out using the camera lens — not physical movement.",
      url: "https://www.youtube.com/embed/87e4DN-86NE"
    },
    {
      title: "Tracking Shot",
      description: "The camera physically follows the subject as it moves.",
      url: "https://www.youtube.com/embed/6Kpr2MuKW0A"
    },
    {
      title: "Crane Shot",
      description: "Camera moves vertically (high ↕ low) using a crane or jib.",
      url: "https://www.youtube.com/embed/tjGHBjxVvqg"
    }
  ],

  Cuts: [
    {
      title: "Match Cut",
      description: "A seamless transition between two similar visual elements or movements.",
      url: "https://www.youtube.com/embed/2T42o9LsNm0?start=45"
    },
    {
      title: "Jump Cut",
      description: "An abrupt cut forward in time, breaking continuity but often used stylistically.",
      url: "https://www.youtube.com/embed/2T42o9LsNm0?start=105"
    },
    {
      title: "J Cut",
      description: "Audio from the next scene plays before the visual appears, creating anticipation.",
      url: "https://www.youtube.com/embed/2T42o9LsNm0?start=165"
    },
    {
      title: "L Cut",
      description: "Audio from the current scene continues over the visuals of the next scene.",
      url: "https://www.youtube.com/embed/2T42o9LsNm0?start=225"
    },
    {
      title: "Smash Cut",
      description: "A sudden, dramatic shift in tone or action between scenes. Often used for humor or shock.",
      url: "https://www.youtube.com/embed/2T42o9LsNm0?start=285"
    }
  ],

  Transitions: [
    {
      title: "Cross Dissolve",
      description: "A smooth fade between two scenes, often used to signify a passage of time or a soft transition.",
      url: "https://www.youtube.com/embed/J6YPU-pJnuU"
    },
    {
      title: "Fade In / Fade Out",
      description: "Scenes gradually appear from or disappear to black, commonly used at the beginning or end of scenes.",
      url: "https://www.youtube.com/embed/-NKdUh7mLrI"
    },
    {
      title: "Wipe",
      description: "One scene replaces another by moving across the screen, often used to indicate a change in location or time.",
      url: "https://www.youtube.com/embed/gceCw-Z3po8"
    },
    {
      title: "Morph Cut",
      description: "A seamless transition that blends similar shots, often used to hide jump cuts in interviews.",
      url: "https://www.youtube.com/embed/8dv9GBSN5k8"
    },
    {
      title: "Zoom Transition",
      description: "A dynamic zoom effect that transitions between scenes, adding energy and focus.",
      url: "https://www.youtube.com/embed/MUEfz83WIa8"
    }
  ]
};

export default function Tutorial() {
  const [activeTab, setActiveTab] = useState("Camera Movements");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - 20% */}
      <div className="w-1/5 bg-gray-100 p-6 border-r">
        <h2 className="text-2xl font-bold mb-6">Tutorials</h2>
        {Object.keys(tutorials).map((category) => (
          <button
            key={category}
            onClick={() => setActiveTab(category)}
            className={`block w-full text-left py-2 px-4 rounded mb-2 ${
              activeTab === category
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Content - 80% */}
      <div className="w-4/5 p-6 overflow-y-auto">
        <div className="grid gap-10">
          {tutorials[activeTab]?.length > 0 ? (
            tutorials[activeTab].map((item, index) => (
              <div key={index}>
                <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-600 mb-2">{item.description}</p>
                <div className="bg-black rounded overflow-hidden">
                  <iframe
                    width="100%"
                    height="450"
                    src={item.url}
                    title={item.title}
                    frameBorder="0"
                    allowFullScreen
                    className="w-full"
                  ></iframe>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No tutorials yet for this section.</p>
          )}
        </div>
      </div>
    </div>
  );
}
