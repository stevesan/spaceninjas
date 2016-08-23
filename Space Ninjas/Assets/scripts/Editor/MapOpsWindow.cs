using UnityEngine;
using UnityEditor;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using LitJson;

public class MapOpsWindow : EditorWindow
{
    public class JsonColor32 {
        public byte r, g, b, a;

        public Color32 AsColor32() {
            return new Color32(r, g, b, a);
        }

        public static JsonColor32 From(Color32 src) {
            var rv = new JsonColor32();
            rv.r = src.r;
            rv.g = src.g;
            rv.b = src.b;
            rv.a = src.a;
            return rv;
        }
    }

    public class EntityInfo {
        public string lastPrefabPath;   // purely for convenience - not really important.
        public JsonColor32 bitmapColor;
    }

    public class MapImportSettings {
        public Dictionary <string, EntityInfo> guid2info = new Dictionary<string, EntityInfo>();

        public void RefreshFrom(string dir) {
            foreach( string assetPath in Directory.GetFiles(dir) ) {
                if(assetPath.EndsWith(".prefab")) {
                    string guid = AssetDatabase.AssetPathToGUID(assetPath);

                    if(!guid2info.ContainsKey(guid)) {
                        Debug.Log("Found unmapped entity: " + assetPath);
                        var info = new EntityInfo();
                        info.bitmapColor = JsonColor32.From(new Color32(0,0,0, 255));
                        guid2info[guid] = info;
                    }

                    // update path
                    guid2info[guid].lastPrefabPath = assetPath;
                }
            }
            foreach( string subdir in AssetDatabase.GetSubFolders(dir) ) {
                RefreshFrom(subdir);
            }
        }
    }

    [MenuItem ("Window/Map Ops")]
    public static void  ShowWindow () {
        EditorWindow.GetWindow(typeof(MapOpsWindow));
    }

    Color32 testColor;

    MapImportSettings import = new MapImportSettings();

    void OnGUI () {
        if(GUILayout.Button("fds")) {
            Debug.Log("HI");
        }

        if(GUILayout.Button("test json")) {
            var info = new EntityInfo();
            info.lastPrefabPath = "foo/bar";
            info.bitmapColor = JsonColor32.From(Color.yellow);
            string json = JsonMapper.ToJson(info);
            Debug.Log(json);

            var info2 = JsonMapper.ToObject<EntityInfo>(json);
            Debug.Log(info2.lastPrefabPath);
            Debug.Log(info2.bitmapColor.AsColor32());

            var settings = new MapImportSettings();
            settings.guid2info["test"] = info;
            Debug.Log(JsonMapper.ToJson(settings));
        }

        if(import != null) {
            if(GUILayout.Button("Refresh Prefabs")) {
                //Object objSelected = Selection.activeObject;
                //string path = AssetDatabase.GetAssetPath(objSelected);
                string path = "Assets/prefabs";
                Debug.Log("looking in " + path);
                import.RefreshFrom(path);
            }

            if(GUILayout.Button("Save to Disk")) {
                string path = "mapImportSettings.json";
                System.IO.File.WriteAllText(path, JsonMapper.ToJson(import));
            }

            if(GUILayout.Button("Load from Disk")) {
            }

            foreach(var entry in import.guid2info) {
                var guid = entry.Key;
                var info = entry.Value;
                info.bitmapColor = JsonColor32.From(EditorGUILayout.ColorField(info.lastPrefabPath, info.bitmapColor.AsColor32()));
            }
        }
    }

}

