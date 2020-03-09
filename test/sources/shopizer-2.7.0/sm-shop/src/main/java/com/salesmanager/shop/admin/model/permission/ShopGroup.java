
package com.salesmanager.shop.admin.model.permission;

import com.fasterxml.jackson.annotation.jsonAnyGetter;
import com.fasterxml.jackson.annotation.jsonAnySetter;
import com.fasterxml.jackson.annotation.jsonIgnore;
import com.fasterxml.jackson.annotation.jsonInclude;
import com.fasterxml.jackson.annotation.jsonProperty;
import com.fasterxml.jackson.annotation.jsonPropertyOrder;

import java.io.Serializable;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "name"
})
public class ShopGroup implements Serializable
{

    @JsonProperty("name")
    private List<String> name = null;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();
    private final static long serialVersionUID = 8390421982207090115L;

    @JsonProperty("name")
    public List<String> getName() {
        return name;
    }

    @JsonProperty("name")
    public void setName(List<String> name) {
        this.name = name;
    }

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    @JsonAnySetter
    public void setAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
    }

}
