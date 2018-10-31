package edu.eci.arsw.collabpaint;

import edu.eci.arsw.collabpaint.model.Point;
import edu.eci.arsw.collabpaint.model.Polygon;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 *
 * @author sergio
 */
@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;
    
    Map<String, Queue<Point>> memory = new ConcurrentHashMap<>(); 

    @MessageMapping("/newpoint.{numberId}")
    public void handlePointEvent(Point pt, @DestinationVariable String numberId) throws Exception {
        System.out.println("New point recived from server!: " + pt);
        msgt.convertAndSend("/topic/newpoint." + numberId, pt);
        Queue<Point> queu;
        if(memory.containsKey(numberId)){
            queu = memory.get(numberId);
        }else{
            queu = new ConcurrentLinkedQueue<>();
            memory.put(numberId, queu);
        }
        queu.add(pt);
        if(queu.size() >= 4){ //3?
            Polygon polygon = new Polygon();
            for(Point p : queu){
                polygon.addPoint(p);
            }
            msgt.convertAndSend("/topic/newpolygon." + numberId, polygon);
            System.out.println("New polygon send to server!: " + polygon);
            memory.put(numberId, new ConcurrentLinkedQueue<>());
        }
        
        
        
    }
}
