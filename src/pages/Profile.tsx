import Navbar from "@/components/Navbar";
import ProfileDashboard from "@/components/ProfileDashboard";
import ReferralStats from "@/components/ReferralStats";
import { motion } from "framer-motion";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 font-display text-3xl font-bold tracking-wider text-foreground"
        >
          Профиль
        </motion.h1>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ProfileDashboard />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ReferralStats />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
