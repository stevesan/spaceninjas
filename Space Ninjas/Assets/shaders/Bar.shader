Shader "Unlit/Bar"
{
	Properties
	{
		_FullColor("FullColor", Color) = (0, 1, 0, 1)
		_EmptyColor("EmptyColor", Color) = (1, 0, 0, 1)
		_Segments("Segments", Float) = 3
		_FullAmount("FullAmount", Float) = 3
		_BarColor("BarColor", Color) = (0,0,0,0)
	}
		SubShader
	{
		Tags { "RenderType" = "Opaque" }
		LOD 100

		Pass
		{
			CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag

			#include "UnityCG.cginc"

			fixed4 _FullColor;
	fixed4 _EmptyColor;
	float _Segments;
	float _FullAmount;

			struct appdata
			{
				float4 vertex : POSITION;
				float2 uv : TEXCOORD0;
			};

			struct v2f
			{
				float2 uv : TEXCOORD0;
				UNITY_FOG_COORDS(1)
				float4 vertex : SV_POSITION;
			};
			
			v2f vert (appdata v)
			{
				v2f o;
				o.vertex = UnityObjectToClipPos(v.vertex);
				o.uv = v.uv;
				return o;
			}

			fixed4 frag (v2f i) : SV_Target
			{
				float x = i.uv.x * _Segments;
				float xf = _FullAmount;

				float r = 0.02;
				float t = smoothstep(xf - r, xf+ r, x);
				fixed4 amountColor = lerp(_FullColor, _EmptyColor, t);

				float barWidth = 0.05;
				float barness = max(
					smoothstep(1 - barWidth, 1, x % 1.0),
					1 - smoothstep(0, barWidth, x % 1.0));

				return lerp(amountColor, fixed4(0,0,0,1), barness);
			}
			ENDCG
		}
	}
}
