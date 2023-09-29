export const loadScriptByURL = (
  elementId: string,
  url: string,
  callback: Function
) => {
  const isScriptExist = document.getElementById(elementId);

  if (!isScriptExist) {
      var script = document.createElement('script');
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