import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Sparkles, X, Gift, Crown, Zap } from "lucide-react";

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RewardModal({ isOpen, onClose }: RewardModalProps) {
  const [showContent, setShowContent] = useState(false);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const contentTimer = setTimeout(() => setShowContent(true), 800);
      const rewardTimer = setTimeout(() => setShowReward(true), 1500);
      return () => {
        clearTimeout(contentTimer);
        clearTimeout(rewardTimer);
      };
    } else {
      setShowContent(false);
      setShowReward(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const confettiPieces = Array.from({ length: 40 }, (_, i) => i);
  const fireworksCount = Array.from({ length: 12 }, (_, i) => i);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 flex items-center justify-center p-4 sm:p-6 overflow-hidden"
    >
      {/* Enhanced Confetti Animation */}
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece}
          className={`absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
            piece % 4 === 0 ? 'bg-yellow-400' :
            piece % 4 === 1 ? 'bg-pink-400' :
            piece % 4 === 2 ? 'bg-blue-400' : 'bg-green-400'
          }`}
          initial={{
            x: typeof window !== 'undefined' ? window.innerWidth / 2 : 200,
            y: typeof window !== 'undefined' ? window.innerHeight / 2 : 200,
            rotate: 0,
            scale: 0,
          }}
          animate={{
            x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 400,
            y: typeof window !== 'undefined' ? window.innerHeight + 150 : 700,
            rotate: [0, 180, 360, 540],
            scale: [0, 1.5, 1, 0.5, 0],
          }}
          transition={{
            duration: 4,
            delay: Math.random() * 3,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Firework Bursts */}
      {fireworksCount.map((firework) => (
        <motion.div
          key={`firework-${firework}`}
          className="absolute"
          initial={{
            x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 400,
            y: typeof window !== 'undefined' ? Math.random() * (window.innerHeight * 0.6) : Math.random() * 300,
          }}
        >
          {Array.from({ length: 8 }).map((_, spark) => (
            <motion.div
              key={spark}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full"
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((spark * Math.PI) / 4) * 30,
                y: Math.sin((spark * Math.PI) / 4) * 30,
              }}
              transition={{
                duration: 1.5,
                delay: firework * 0.3 + Math.random() * 2,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>
      ))}

      {/* Enhanced Floating Elements */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={`element-${i}`}
          className="absolute text-white opacity-70"
          initial={{
            x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 400,
            y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 600,
            scale: 0,
            rotate: 0,
          }}
          animate={{
            scale: [0, 1.2, 0.8, 1, 0],
            rotate: 360,
            y: [null, -100],
          }}
          transition={{
            duration: 5,
            delay: Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {i % 3 === 0 ? <Star className="w-4 h-4 sm:w-5 sm:h-5" /> :
           i % 3 === 1 ? <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" /> :
           <Zap className="w-4 h-4 sm:w-5 sm:h-5" />}
        </motion.div>
      ))}

      {/* Main Content */}
      <motion.div
        initial={{ scale: 0, y: 100, rotateY: 180 }}
        animate={{ scale: showContent ? 1 : 0, y: showContent ? 0 : 100, rotateY: showContent ? 0 : 180 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 15,
          delay: 0.3 
        }}
        className="bg-gradient-to-br from-white to-yellow-50 rounded-3xl sm:rounded-3xl p-6 sm:p-8 max-w-sm w-full mx-4 text-center shadow-2xl relative overflow-hidden border-4 border-yellow-300"
      >
        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          onClick={onClose}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors z-10 border-2 border-red-300"
          aria-label="Close reward modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
        </motion.button>

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={`bg-sparkle-${i}`}
              className="absolute text-yellow-500"
              style={{
                left: `${10 + i * 15}%`,
                top: `${10 + (i % 3) * 30}%`,
              }}
              animate={{
                scale: [1, 2, 1],
                rotate: [0, 360],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3,
                delay: i * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Crown className="w-6 h-6 sm:w-8 sm:h-8" />
            </motion.div>
          ))}
        </div>

        {/* Reward Icon with Enhanced Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -360, y: -50 }}
          animate={{ scale: 1, rotate: 0, y: 0 }}
          transition={{ 
            delay: 1.0, 
            type: "spring", 
            stiffness: 150,
            damping: 10
          }}
          className="mx-auto mb-4 sm:mb-6 relative"
        >
          <motion.div
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(255, 215, 0, 0.5)",
                "0 0 40px rgba(255, 215, 0, 0.8)",
                "0 0 20px rgba(255, 215, 0, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center"
          >
            <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </motion.div>
          
          {/* Rotating Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-dashed border-yellow-400 rounded-full"
          />
        </motion.div>

        {/* Title with Typing Effect */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6"
        >
          🎊 AMAZING! 🎊
        </motion.h1>

        {/* Reward Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: showReward ? 1 : 0, scale: showReward ? 1 : 0.8 }}
          transition={{ delay: 1.8, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              textShadow: [
                "0 0 10px rgba(255, 215, 0, 0.5)",
                "0 0 20px rgba(255, 215, 0, 0.8)",
                "0 0 10px rgba(255, 215, 0, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xl sm:text-2xl font-bold text-green-600 mb-3"
          >
            ₹10,000 BONUS!
          </motion.div>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed px-2">
            Congratulations! You have unlocked a bonus of <span className="font-bold text-green-600">Rs 10,000</span> for completing Stage 2!
          </p>
        </motion.div>

        {/* Celebration Elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2 }}
          className="flex justify-center space-x-4 mb-4"
        >
          {[Trophy, Crown, Star].map((Icon, index) => (
            <motion.div
              key={index}
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 1.5, 
                delay: index * 0.2,
                repeat: Infinity 
              }}
              className="w-8 h-8 text-yellow-500"
            >
              <Icon className="w-full h-full" />
            </motion.div>
          ))}
        </motion.div>

        {/* Pulsing Success Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.5, type: "spring" }}
          className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-lg border-4 border-white"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-2xl sm:text-3xl"
          >
            💰
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Multiple Pulsing Ring Effects */}
      {[1, 1.8, 2.6].map((scale, index) => (
        <motion.div
          key={index}
          className="absolute border-4 border-yellow-400 rounded-full opacity-30"
          animate={{
            scale: [1, scale, scale * 1.5],
            opacity: [0.6, 0.3, 0],
          }}
          transition={{
            duration: 3,
            delay: index * 0.8,
            repeat: Infinity,
            ease: "easeOut",
          }}
          style={{
            left: '50%',
            top: '50%',
            width: '100px',
            height: '100px',
            marginLeft: '-50px',
            marginTop: '-50px',
          }}
        />
      ))}
    </motion.div>
  );
}