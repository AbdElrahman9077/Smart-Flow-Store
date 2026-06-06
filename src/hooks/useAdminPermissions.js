import useAdmin from "./useAdmin";

function useAdminPermissions() {
  const admin = useAdmin();
  return {
    ...admin,
    hasPermission: admin.hasPermission,
    hasAnyPermission: admin.hasAnyPermission,
    hasAllPermissions: admin.hasAllPermissions,
  };
}

export default useAdminPermissions;
