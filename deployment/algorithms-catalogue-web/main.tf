provider "opentelekomcloud" {
  domain_name = "OTC00000000001000119703"
  tenant_name = "eu-nl"
  auth_url    = "https://iam.eu-de.otc.t-systems.com/v3"
}

data "opentelekomcloud_cce_cluster_v3" "cluster" {
  name = "production"
}

data "opentelekomcloud_cce_cluster_kubeconfig_v3" "this" {
  cluster_id = data.opentelekomcloud_cce_cluster_v3.cluster.id
}

resource "local_sensitive_file" "kube_config" {
  filename = "${path.module}/kubeconfig.json"
  content  = data.opentelekomcloud_cce_cluster_kubeconfig_v3.this.kubeconfig

  lifecycle {
    ignore_changes = [
      content
    ]
  }
}
