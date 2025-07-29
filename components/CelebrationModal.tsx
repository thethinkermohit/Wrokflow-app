import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Trophy, Star, Sparkles, X } from "lucide-react";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: number;
}

export function CelebrationModal({ isOpen, onClose, stage }: CelebrationModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const confettiPieces = Array.from({ length: 20 }, (_, i) => i);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Enhanced Medical-themed Confetti */}
      {confettiPieces.map((piece) => {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        const shapes = ['🎉', '✨', '🌟', '💙', '🏆'];
        return (
          <motion.div
            key={piece}
            className="absolute text-lg pointer-events-none"
            initial={{
              x: typeof window !== 'undefined' ? window.innerWidth / 2 : 200,
              y: typeof window !== 'undefined' ? window.innerHeight / 2 : 200,
              rotate: 0,
              scale: 0,
            }}
            animate={{
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 400,
              y: typeof window !== 'undefined' ? window.innerHeight + 100 : 600,
              rotate: [0, 180, 360, 540],
              scale: [0, 1.5, 1, 0.5, 0],
            }}
            transition={{
              duration: 4,
              delay: Math.random() * 2,
              ease: "easeOut",
            }}
          >
            {shapes[piece % shapes.length]}
          </motion.div>
        );
      })}

      {/* Floating Stars */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute text-white opacity-60"
          initial={{
            x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 400,
            y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 600,
            scale: 0,
            rotate: 0,
          }}
          animate={{
            scale: [0, 1, 0],
            rotate: 360,
            y: [null, -50],
          }}
          transition={{
            duration: 4,
            delay: Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Star className="w-3 h-3 sm:w-4 sm:h-4" />
        </motion.div>
      ))}

      {/* Main Content */}
      <motion.div
        initial={{ scale: 0, y: 50 }}
        animate={{ scale: showContent ? 1 : 0, y: showContent ? 0 : 50 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          delay: 0.2 
        }}
        className="glass-card p-6 sm:p-8 max-w-sm w-full mx-4 text-center relative overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(59, 130, 246, 0.3)'
        }}
      >
        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onClose}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
          aria-label="Close celebration"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </motion.button>

        {/* Background Sparkles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute text-yellow-300"
              style={{
                left: `${20 + i * 20}%`,
                top: `${15 + i * 20}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                rotate: [0, 180, 360],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6" />
            </motion.div>
          ))}
        </div>

        {/* Enhanced Medical Trophy Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.7, 
            type: "spring", 
            stiffness: 200 
          }}
          className="mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)'
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>
          
          {/* Pulsing Glow Effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              filter: 'blur(4px)'
            }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4"
        >
          Congratulations! 🎉
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed px-2"
        >
          Well done on finishing Stage {stage}! You're now one step closer to unlocking your first reward. Dive into Stage {stage + 1} with the same energy—you've got this!
        </motion.p>

        {/* Celebration Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, type: "spring" }}
          className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-green-500 text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shadow-lg"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-lg sm:text-xl"
          >
            ✨
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Pulsing Ring Effect */}
      <motion.div
        className="absolute border-2 sm:border-4 border-white rounded-full opacity-20"
        animate={{
          scale: [1, 1.5, 2],
          opacity: [0.4, 0.2, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
        }}
        style={{
          left: '50%',
          top: '50%',
          width: '80px',
          height: '80px',
          marginLeft: '-40px',
          marginTop: '-40px',
        }}
      />
    </motion.div>
  );
}