import { createContext, useEffect, useRef, useState } from 'react';

type AudioContextType = {
  setSound: (src: string | null) => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const AudioProvider = () => {
  const soundRef = useRef<Howl | null>(null);
  const [sound, setSound] = useState<string | null>(null);

  const playNewSound = (src: string) => {
    const newSound = new Howl({
      src: [src],
      autoplay: true,
      loop: true,
    });

    newSound.play();
    soundRef.current = newSound;
  };

  useEffect(() => {
    if (!soundRef.current) return;

    const oldSound = soundRef.current;

    oldSound.stop();
    oldSound.unload();
    if (sound) playNewSound(sound);
  }, [sound]);

  const value = {
    setSound,
  };

  return <AudioContext.Provider value={value}></AudioContext.Provider>;
};

export default AudioProvider;
