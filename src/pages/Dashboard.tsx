import { Layout } from "@/components/Layout";
import { useRole } from "@/contexts/RoleContext";
import { RoleDashboardContent } from "./RoleDashboards";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { currentRole } = useRole();

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentRole}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
        >
          <RoleDashboardContent role={currentRole} />
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
