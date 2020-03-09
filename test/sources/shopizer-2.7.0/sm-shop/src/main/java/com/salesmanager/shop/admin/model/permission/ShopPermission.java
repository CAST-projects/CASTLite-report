
package com.salesmanager.shop.admin.model.permission;

import com.fasterxml.jackson.annotation.jsonAnyGetter;
import com.fasterxml.jackson.annotation.jsonAnySetter;
import com.fasterxml.jackson.annotation.jsonIgnore;
import com.fasterxml.jackson.annotation.jsonInclude;
import com.fasterxml.jackson.annotation.jsonProperty;
import com.fasterxml.jackson.annotation.jsonPropertyOrder;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "type",
    "group"
})
public class ShopPermission implements Serializable
{

    @JsonProperty("type")
    private String type;
    @JsonProperty("group")
    private ShopGroup shopGroup;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();
    private final static long serialVersionUID = -7938476709520334066L;

    @JsonProperty("type")
    public String getType() {
        return type;
    }

    @JsonProperty("type")
    public void setType(String type) {
        this.type = type;
    }

    @JsonProperty("group")
    public ShopGroup getShopGroup() {
        return shopGroup;
    }

    @JsonProperty("group")
    public void setShopGroup(ShopGroup shopGroup) {
        this.shopGroup = shopGroup;
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
