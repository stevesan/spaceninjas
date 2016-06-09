
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class UIInputHandler : MonoBehaviour {
    public static UIInputHandler Instance = null;

    private Dictionary<Dir2D, int> dirLastTriggerFrame = new Dictionary<Dir2D, int>();

    void Start() {
        Instance = this;
    }

    void TriggerDir(Dir2D dir) {
        dirLastTriggerFrame[dir] = Time.frameCount;
    }

    public void OnClickUp() {
        Debug.Log("up");
        TriggerDir(Dir2D.Up);
    }

    public void OnClickDown() {
        Debug.Log("down");
        TriggerDir(Dir2D.Down);
    }

    public void OnClickLeft() {
        Debug.Log("down");
        TriggerDir(Dir2D.Left);
    }

    public void OnClickRight() {
        Debug.Log("down");
        TriggerDir(Dir2D.Right);
    }

    public bool IsTriggerMove(Dir2D dir) {
        if(dirLastTriggerFrame.ContainsKey(dir)) {
            return (Time.frameCount - dirLastTriggerFrame[dir]) < 1;
        }
        else {
            return false;
        }
    }

    public bool IsHoldingMove(Dir2D dir) {
        return false; // TODO
    }
}
