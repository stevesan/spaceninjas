using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BlitRT : MonoBehaviour
{
  public RenderTexture renderTexture;

  void OnPreRender()
  {
    GetComponent<Camera>().targetTexture = renderTexture;
  }

  void OnPostRender()
  {
    // Have to null this for the Blit to work.
    // Based on https://answers.unity.com/questions/799941/blit-camera-targettexture-to-screen.html
    GetComponent<Camera>().targetTexture = null;

    float Sw = Screen.width;
    float Sh = Screen.height;
    float Rw = renderTexture.width;
    float Rh = renderTexture.height;
    float bottomV = 1f - (Sw / Sh * Rh / Rw);
    float bv = bottomV;
    // bv * sy + oy = 0
    // 1 * sy + oy = 1 => sy = 1-oy => bv*(1-oy) + oy = 0,  bv-bv*oy+oy = 0, (1-bv)oy = -bv => oy = -bv/(1-bv)
    float oy = -bv / (1f - bv);
    float sy = 1 - oy;

    Vector2 scale = new Vector2(1, sy);
    Vector2 offset = new Vector2(0, oy);
    Graphics.Blit(renderTexture, (RenderTexture)null, scale, offset);
  }
}
