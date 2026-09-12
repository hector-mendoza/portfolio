export function projectSurface(project) {
  return {
    gradient:
      project.sageGradient ||
      project.pastelGradient ||
      project.gradient,
    accent: project.sageAccent || project.pastelAccent || project.accent,
  };
}
