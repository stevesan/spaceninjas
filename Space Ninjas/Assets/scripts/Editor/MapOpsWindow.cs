using UnityEngine;
using UnityEditor;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using LitJson;

public class MapOpsWindow : EditorWindow
{
    [MenuItem ("Window/Map Ops")]
    public static void  ShowWindow () {
        EditorWindow.GetWindow(typeof(MapOpsWindow));
    }

    MapImportSettings importing = null;

    void DestroyChildren(Transform t) {
        var children = new LinkedList<Transform>();
        foreach( Transform c in t ) {
            children.AddLast(c);
        }
        foreach( Transform c in children ) {
            Object.DestroyImmediate(c.gameObject);
        }
    }

    void Generate(MapImportSettings settings) {
        DestroyChildren(settings.transform);

        // create color -> prefab map
        var prefabsByColor = new Dictionary<Color32, GameObject>();
        var palette = settings.palette;
        foreach( var entry in palette.entries ) {
            var prefab = entry.prefab;
            var color = entry.color;
            if(prefab == null) {
                Debug.LogError("null prefab for entry with"
                        + " color = " + entry.color
                        + " lastAssetPath = " + entry.lastAssetPath );
            }
            else {
                prefabsByColor[color] = prefab;
            }
        }
        var unknownColors = new HashSet<Color32>();
        var tex = settings.srcTexture;

        for( int x = 0; x < tex.width; x++ ) {
            for( int y = 0; y < tex.height; y++ ) {
                Color32 sample = tex.GetPixel(x, y);
                if( prefabsByColor.ContainsKey(sample) ) {
                    var prefab = prefabsByColor[sample];
                    GameObject inst = (GameObject)PrefabUtility.InstantiatePrefab(prefab);
                    inst.transform.parent = settings.transform;
                    inst.transform.position = new Vector3(x, y, 0) + settings.offset.AsXY();
                }
                else {
                    unknownColors.Add(sample);
                }
            }
        }

        foreach( var c in unknownColors ) {
            Debug.Log("No prefab for color " + c);
        }
    }

    void OnGUI () {

        importing = (MapImportSettings)EditorGUI.ObjectField( EditorGUILayout.GetControlRect(), importing, typeof(MapImportSettings));

        if(importing != null) {
            var palette = importing.palette;
            var srcTexture = importing.srcTexture;

            if( palette != null && srcTexture != null ) {
                if(GUILayout.Button("Generate")) {
                    Generate(importing);
                }
            }

            if(srcTexture != null) {
                EditorGUI.DrawPreviewTexture(
                        EditorGUILayout.GetControlRect(false, 100),
                        srcTexture);
            }

            if(palette != null) {
                string entsPath = "Assets/prefabs";
                if(GUILayout.Button("Refresh Prefabs ("+entsPath+")")) {
                    //Object objSelected = Selection.activeObject;
                    //string path = AssetDatabase.GetAssetPath(objSelected);
                    RefreshPalette(palette, entsPath);
                }

                foreach(var entry in palette.entries) {
                    string label = entry.lastAssetPath.Substring(20);
                    entry.color = EditorGUILayout.ColorField(label, entry.color);
                }
            }


        }
        else {
            if( Selection.activeGameObject != null ) {
                importing = Selection.activeGameObject.GetComponent<MapImportSettings>();
            }
        }

    }

    public static void RefreshPalette(EntityPalette palette, string dir) {
        var prefab2entry = new Dictionary<GameObject, EntityPalette.Entry>();
        foreach( var entry in palette.entries ) {
            prefab2entry[entry.prefab] = entry;
        }

        foreach( string assetPath in Directory.GetFiles(dir) ) {
            if(assetPath.EndsWith(".prefab")) {
                GameObject prefab = AssetDatabase.LoadAssetAtPath<GameObject>( assetPath );

                if(!prefab2entry.ContainsKey(prefab)) {
                    Debug.Log("Found unmapped entity: " + assetPath);
                    var entry = new EntityPalette.Entry();
                    entry.prefab = prefab;
                    entry.lastAssetPath = assetPath;

                    prefab2entry[prefab] = entry;
                    palette.entries.Add(entry);
                }

                // update path
                prefab2entry[prefab].lastAssetPath = assetPath;

                // always do this just in case
                var c = prefab2entry[prefab].color;
                c = new Color32(c.r, c.g, c.b, 255);
                prefab2entry[prefab].color = c;
            }
        }

        // recurse
        foreach( string subdir in AssetDatabase.GetSubFolders(dir) ) {
            RefreshPalette(palette, subdir);
        }
    }
}

