export function isFacultyEmail(email: string): boolean {
  return /^[^\d]+@cuilahore\.edu\.pk$/i.test(email);
}
