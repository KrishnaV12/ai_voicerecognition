import menu from "../assets/menu.svg";
import audio from "../assets/audio.svg";
import b from "../assets/b.svg";
import addimage from "../assets/gallary.svg";
import { useEffect, useRef, useState } from "react";
import { assembly_API } from "../services/apiService";

const VoiceChat = () => {
  interface DefaultQuestions {
    id: number;
    title: string;
  }

  const DEFAULTQUESTIONS: DefaultQuestions[] = [
    { id: 1, title: "Blood Report and History" },
    { id: 2, title: "Previous Prescription" },
    { id: 3, title: "Reported Symptoms and Allergies" },
    { id: 4, title: "View Health Insights" },
    { id: 5, title: "View Recommendations Today's Tasks" },
    { id: 6, title: "Today's Tasks" },
  ];

  const [inputVal, setInputVal] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcriptID, setTranscriptID] = useState<string>("");
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [transcriptData, setTranscriptData] = useState<any>({});
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<any>([]);

  const startRecording = async () => {
    setIsRecording(true);
    audioChunksRef.current = [];
    setAudioUrl("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 2,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
        const audioUrl = window.URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        setIsRecording(false);

        if (audioBlob) {
          assembly_API
            .post("/upload", audioBlob)
            .then((res: any) => {
              const uploadUrl = res.data.upload_url;
              if (uploadUrl) {
                assembly_API
                  .post("/transcript", { audio_url: uploadUrl })
                  .then((res: any) => {
                    setTranscriptID(res.data.id);
                  })
                  .catch((err) => console.error("Error creating transcript", err));
              }
            })
            .catch((err) => console.error("Error uploading audio", err));
        }
      };
      mediaRecorder.start();
    } catch (error) {
      console.error("Error accessing media devices.", error);
      setIsRecording(false);
    }
  };

  useEffect(() => {
    if (!transcriptID) return;
    const interval = setInterval(async () => {
      setIsLoading(true);
      try {
        const response = await assembly_API.get(`/transcript/${transcriptID}`);
        const { status, text } = response.data;
        setTranscriptData(response.data);
        if (status === "completed") {
          setInputVal(text);
          clearInterval(interval);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching transcript status", error);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [transcriptID, transcriptData.status]);

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <>
      <div className=" flex flex-col items-center justify-center bg-white">
        <div className="container w-full  p-4 bg-white flex place-content-between">
          <div className="flex gap-2 items-center cursor-pointer">
            <img src={menu} alt="menu" />
            <div className="font-bold  text-lg text-gray-800">Voice Recognition</div>
          </div>
          <div>
            <img src={b} alt="" />
          </div>
        </div>
        <div className="w-full mb-6 container ">
          <p className="font-medium text-2xl text-gray-950 text-center items-center py-6 mt-36">Click On Microfhone to record Your Voice</p>
          <div className="flex flex-wrap  gap-3 justify-center space-x-2 mt-6 ">
            {DEFAULTQUESTIONS.map((val: DefaultQuestions) => {
              return (
                <button
                  onClick={() => setInputVal(val.title)}
                  key={val.id}
                  className="py-2 px-4 bg-white shadow-lg  rounded-full hover:bg-gray-300 transition"
                >
                  {val.title}
                </button>
              );
            })}
          </div>
        </div>
        {/* to check if audio is recording or not */}
        {audioUrl && (
          <audio controls>
            <source src={audioUrl} type="audio/wav" />
          </audio>
        )}

        <div className="fixed flex  bottom-8 w-full px-8 max-w-screen-lg bg-white border rounded-full shadow-md  ">
          <input
            onChange={(e) => setInputVal(e.target.value)}
            value={isLoading ? "Processing..." : inputVal}
            type="text"
            placeholder="Ask anything"
            className="w-full py-5 px-4 bg-white border text-slate-950 rounded-full outline-none border-none"
          />
          <div className="flex gap-4 items-center cursor-pointer">
            <img src={addimage} alt="uploadImage" />
            <img
              src={audio}
              alt="Record Audio"
              onClick={isRecording ? stopRecording : startRecording}
              style={{ animation: isRecording ? "pulse-animation 1s infinite" : "" }}
            />
          </div>
          <style>
            {`
             @keyframes pulse-animation {
               0% { transform: scale(1); }
               50% { transform: scale(1.2); }
               100% { transform: scale(1); }
             }
           `}
          </style>
        </div>
      </div>
    </>
  );
};

export default VoiceChat;
