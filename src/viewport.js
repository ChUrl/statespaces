export const get_viewport_dims = () => {
  let vw = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0,
  );
  let vh = Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0,
  );

  return [vw, vh];
};
