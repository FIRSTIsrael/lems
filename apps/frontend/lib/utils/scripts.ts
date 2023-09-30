export const loadScriptByURL = (elementId: string, url: string, callback?: () => void) => {
  const isScriptExist = document.getElementById(elementId);

  if (!isScriptExist) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.id = elementId;
    script.onload = function () {
      if (callback) callback();
    };
    document.body.appendChild(script);
  }

  if (isScriptExist && callback) callback();
};
