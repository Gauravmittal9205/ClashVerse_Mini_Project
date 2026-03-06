import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.util.List;
import java.util.Map;

public class Test {
    public static void main(String[] args) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        String json = "[{\"id\":1, \"input\":\"input\", \"output\":\"output\"}]";
        List<Map<String, String>> map = objectMapper.readValue(json, new TypeReference<>() {});
        System.out.println(map.get(0).get("id").getClass());
    }
}
