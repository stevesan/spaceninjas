
using UnityEditor;
using UnityEngine;

public class MiscMenuItems : EditorWindow {

    [MenuItem("Edit/Reset Playerprefs")] public static void DeletePlayerPrefs()
    {
        PlayerPrefs.DeleteAll();
    }

}
