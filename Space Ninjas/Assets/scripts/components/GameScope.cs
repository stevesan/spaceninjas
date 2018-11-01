
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

//----------------------------------------
//  Provides a better way of getting references to "global-ish" objects, such as the main player.
//  Works as more of a..singleton table for certain components.
//----------------------------------------
public class GameScope : MonoBehaviour
{
  Dictionary<System.Type, MonoBehaviour> instancesByType =
      new Dictionary<System.Type, MonoBehaviour>();

  public T Get<T>() where T : MonoBehaviour
  {
    if (!instancesByType.ContainsKey(typeof(T)))
    {
      T[] objs = GetComponentsInChildren<T>();
      if (objs.Length != 1)
      {
        Debug.LogError("Found " + objs.Length + " game objects in scene of type " + typeof(T) + ", instead of just 1. Just using the first one...");
      }

      Debug.Log("Found singleton instance of type " + typeof(T) + ". Name = " + objs[0].gameObject.name);
      instancesByType[typeof(T)] = objs[0];
    }

    return instancesByType[typeof(T)] as T;
  }
}
