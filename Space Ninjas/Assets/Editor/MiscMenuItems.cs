
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
}
