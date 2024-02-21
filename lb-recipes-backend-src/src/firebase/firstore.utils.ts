export const byUpdateTimeDescending = (
  a: FirebaseFirestore.QueryDocumentSnapshot,
  b: FirebaseFirestore.QueryDocumentSnapshot,
) => b.updateTime.seconds - a.updateTime.seconds;
