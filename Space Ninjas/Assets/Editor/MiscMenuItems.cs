
using UnityEditor;
using UnityEngine;

public class MiscMenuItems : EditorWindow {

    [MenuItem("Edit/Reset Playerprefs")] public static void DeletePlayerPrefs()
    {
        PlayerPrefs.DeleteAll();
    }

    [MenuItem("Edit/Print Prefab Path")] public static void PrintPrefabPath()
    {
        var obj = Selection.activeGameObject;
        if( obj != null ) {
            var prefab = EditorUtility.GetPrefabParent(obj);
            Debug.Log(prefab.name);
            Debug.Log(AssetDatabase.GetAssetPath( prefab ));
        }

    }

    [MenuItem("Edit/Update All Managed Prefabs")] public static void UpdateAllManagedPrefabs()
    {
        foreach(var path in AssetDatabase.GetAllAssetPaths() ) {
            if( path.Contains("Resources") && path.EndsWith(".prefab") ) {
                GameObject prefab = AssetDatabase.LoadAssetAtPath<GameObject>(path);
                var tag = prefab.GetComponent<SerializedNode>();
                if( tag != null ) {
                    Debug.Log("-----");
                    Debug.Log(path);

                    // find last instance of /Resources/, remove up to and including
                    // and remove extension
                    string toFind = "/Resources/";
                    int start = path.LastIndexOf(toFind) + toFind.Length;
                    int end = path.LastIndexOf(".prefab");
                    string resPath = path.Substring(start, end-start);
                    Debug.Log(resPath);

                    tag.prefabResourcePath = resPath;
                }
            }
        }

        AssetDatabase.SaveAssets();
    }
}
